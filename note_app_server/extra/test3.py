from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_mysqldb import MySQL

app = Flask(__name__)
CORS(app)
# CORS(app, supports_credentials=True)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'myuser'
app.config['MYSQL_PASSWORD'] = 'password123'
app.config['MYSQL_DB'] = 'notes_app_test'


mysql = MySQL(app)
app.secret_key = 'not-so-secrete-huh'


@app.route("/message")
def index():
    return jsonify({"message": "hello form flask"})


@app.route("/login", methods=['POST'])
def login():
    loginData = request.get_json()
    uname = loginData['username']
    pwd = loginData['password']
    
    cur = mysql.connection.cursor()
    cur.execute("CALL checkLogin(%s, %s)", (uname, pwd))
    user_id = cur.fetchone()
    
    if user_id:
        session['user_id'] = user_id[0]
        print(session)
        test = session.get('user_id')
        testingSesssion()
        return jsonify({"userId": test}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 404


def testingSesssion():
    user_id = session.get('user_id')
    print(user_id)
    print(session)
    
    
@app.route("/protected", methods=['GET'])
# @login_required
def protected_route():
    user_id = session.get('user_id')
    print(user_id)
    print(session)
    return jsonify({"message": "This is a protected route."}), 200
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)