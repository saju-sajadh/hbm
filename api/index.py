from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import datetime
from demo import nationality, neg_review, pos_review, trip_types
import csv
from recommend import recommend_hotel

app = Flask(__name__)
CORS(app)


def generate_random_data():
    additional_scoring = random.randint(0, 10)
    review_date = datetime.date.today() - datetime.timedelta(days=random.randint(0, 365))
    average_score = round(random.uniform(1, 5), 1)
    reviewer_nationality = random.choice(nationality)
    negative_review = "This hotel was " + random.choice(neg_review) + "."
    review_total_negative_word_counts = len(negative_review.split())
    total_number_of_reviews = random.randint(10, 100)
    positive_review = "This hotel was " + random.choice(pos_review) + "."
    review_total_positive_word_counts = len(positive_review.split())
    total_number_of_reviews_reviewer_has_given = random.randint(10, 100)
    reviewer_score = round(random.uniform(1, 5), 1)
    tags = random.choice(trip_types)
    days_since_review = (datetime.date.today() - review_date).days
    return {
        "Additional_Number_of_Scoring": additional_scoring,
        "Review_Date": review_date,
        "Average_Score": average_score,
        "Reviewer_Nationality": reviewer_nationality,
        "Negative_Review": negative_review,
        "Review_Total_Negative_Word_Counts": review_total_negative_word_counts,
        "Total_Number_of_Reviews": total_number_of_reviews,
        "Positive_Review": positive_review,
        "Review_Total_Positive_Word_Counts": review_total_positive_word_counts,
        "Total_Number_of_Reviews_Reviewer_Has_Given": total_number_of_reviews_reviewer_has_given,
        "Reviewer_Score": reviewer_score,
        "Tags": tags,
        "days_since_review": days_since_review
    }

def write_to_csv(hotel_name, address, lat, lng):
    with open('api/dataset/hotels.csv', 'a', newline='') as csvfile:
        fieldnames = ["Hotel_Address", "Additional_Number_of_Scoring", "Review_Date", "Average_Score", "Hotel_Name", "Reviewer_Nationality", "Negative_Review", "Review_Total_Negative_Word_Counts", "Total_Number_of_Reviews", "Positive_Review", "Review_Total_Positive_Word_Counts", "Total_Number_of_Reviews_Reviewer_Has_Given", "Reviewer_Score", "Tags", "days_since_review", "lat", "lng"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        if csvfile.tell() == 0:
            writer.writeheader()
        for _ in range(50):  # Generate 400 lines of data
            random_data = generate_random_data()
            writer.writerow({
                "Hotel_Address": address,
                "Additional_Number_of_Scoring": random_data["Additional_Number_of_Scoring"],
                "Review_Date": random_data["Review_Date"],
                "Average_Score": random_data["Average_Score"],
                "Hotel_Name": hotel_name,
                "Reviewer_Nationality": random_data["Reviewer_Nationality"],
                "Negative_Review": random_data["Negative_Review"],
                "Review_Total_Negative_Word_Counts": random_data["Review_Total_Negative_Word_Counts"],
                "Total_Number_of_Reviews": random_data["Total_Number_of_Reviews"],
                "Positive_Review": random_data["Positive_Review"],
                "Review_Total_Positive_Word_Counts": random_data["Review_Total_Positive_Word_Counts"],
                "Total_Number_of_Reviews_Reviewer_Has_Given": random_data["Total_Number_of_Reviews_Reviewer_Has_Given"],
                "Reviewer_Score": random_data["Reviewer_Score"],
                "Tags": random_data["Tags"],
                "days_since_review": random_data["days_since_review"],
                "lat": lat,
                "lng": lng
            })


@app.route('/api', methods=['POST'])
def home():
    return 'Welcome to the Flask Service!'

@app.route('/api/list_hotel', methods=['GET'])
def list_hotel():
    hotel_name = request.form['hotel_name']
    address = request.form['address']
    lat = request.form['lat']
    lng = request.form['lng']
    write_to_csv(hotel_name, address, lat, lng)

@app.route('/api/recommend', methods=['POST'])
def recommendHotels():
    try:
        # Get parameters from request
        location = request.form['location']
        description = request.form['description']
        
        # Validate input
        if not location or not description:
            return jsonify({"error": "Please provide both location and description parameters."}), 400
        
        # Call the recommendation function
        recommended_hotels = recommend_hotel(location, description)
        
        # Return the result as JSON
        return jsonify(recommended_hotels)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500