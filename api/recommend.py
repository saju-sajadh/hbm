import os
import pandas as pd
import numpy as np
from nltk.tokenize import word_tokenize
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.corpus import stopwords

def load_data():
    file_path = "api/dataset/hotels.csv"
    # Check if the file exists and is not empty
    if os.path.exists(file_path) and os.stat(file_path).st_size > 0:
        return pd.read_csv(file_path)
    else:
        # Return an empty DataFrame or a default value
        return pd.DataFrame()

# Load data
data = load_data()

# Preprocess the data if available
if not data.empty:
    data["countries"] = data.Hotel_Address.apply(lambda x: x.split(' ')[-1])
    data.drop(['Additional_Number_of_Scoring', 'Review_Date', 'Reviewer_Nationality',
               'Negative_Review', 'Review_Total_Negative_Word_Counts',
               'Total_Number_of_Reviews', 'Positive_Review',
               'Review_Total_Positive_Word_Counts', 'Total_Number_of_Reviews_Reviewer_Has_Given',
               'Reviewer_Score', 'days_since_review', 'lat', 'lng'], axis=1, inplace=True, errors='ignore')

    def impute(column):
        column = column.iloc[0]
        if isinstance(column, str):
            return column
        else:
            return "".join(map(str, column))

    data["Tags"] = data[["Tags"]].apply(impute, axis=1)
    data['countries'] = data['countries'].str.lower()
    data['Tags'] = data['Tags'].str.lower()

def recommend_hotel(location, description):
    if data.empty:
        return {"message": "No hotel data available at the moment."}

    description = description.lower()
    description_tokens = word_tokenize(description)
    
    stop_words = set(stopwords.words('english'))
    lemm = WordNetLemmatizer()
    filtered_set = {lemm.lemmatize(word) for word in description_tokens if word not in stop_words}
    
    country_hotels = data[data['countries'] == location.lower()]
    country_hotels = country_hotels.set_index(np.arange(country_hotels.shape[0]))
    
    if country_hotels.empty:
        return {"message": f"No hotels found in {location}."}
    
    cos = []
    for i in range(country_hotels.shape[0]):
        tag_tokens = word_tokenize(country_hotels["Tags"][i])
        tag_set = {lemm.lemmatize(word) for word in tag_tokens if word not in stop_words}
        vector = tag_set.intersection(filtered_set)
        cos.append(len(vector))
    
    country_hotels['similarity'] = cos
    country_hotels = country_hotels.sort_values(by='similarity', ascending=False)
    country_hotels.drop_duplicates(subset='Hotel_Name', keep='first', inplace=True)
    country_hotels.sort_values('Average_Score', ascending=False, inplace=True)
    country_hotels.reset_index(inplace=True, drop=True)
    
    return country_hotels[["Hotel_Name", "Average_Score", "Hotel_Address"]].head().to_dict(orient='records')[0]