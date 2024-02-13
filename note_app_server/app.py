from flask import Flask, jsonify, request
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
# app.secret_key = 'not-so-secrete-huh'
session = dict()

@app.route("/")
def index():
    session.clear()
    return jsonify({"message": "hello form flask"})


@app.route("/message")
def message():
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
        
        test = session["user_id"]
        return jsonify({"userId": test}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
    
    
@app.route("/getNotes", methods=['POST'])
def getNotes():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        userId = session["user_id"]
        
        cur = mysql.connection.cursor()
        
        cur.execute("CALL getNotes(%s)", (userId,))
        notes = cur.fetchall()
        
        
        cur.close()
        return jsonify({"notes": notes})


@app.route("/newNotes", methods=['POST'])
def new_Notes():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        data = request.get_json()
        userId = session["user_id"]
        print(data)
        
        cur = mysql.connection.cursor()
        cur.execute("CALL newNote(%s, %s, %s, %s)", (userId, data[0], data[1], data[2]))
        mysql.connection.commit()
        
        cur.close()
        
        return jsonify({"new note added": data})


@app.route("/deleteNote", methods=['POST'])
def deleteNote():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        noetkey = request.get_json()
        userId = session["user_id"]
        # print(noetkey)
        
        cur = mysql.connection.cursor()
        
        cur.execute(f"CALL deleteNote({userId},{noetkey})")
        mysql.connection.commit()
        
        cur.close()
        
        
        return jsonify({"delete key": noetkey})
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)