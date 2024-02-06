from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL

app = Flask(__name__)
CORS(app)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'myuser'
app.config['MYSQL_PASSWORD'] = 'password123'
app.config['MYSQL_DB'] = 'notes_app_test'

mysql = MySQL(app)


@app.route("/message")
def index():
    return jsonify({"message": "hello form flask"})


@app.route("/getNotes", methods=['GET'])
def getNotes():
    cur = mysql.connection.cursor()
    
    cur.execute("CALL getNotes()")
    notes = cur.fetchall()
    
    
    cur.close()
    return jsonify({"notes": notes})


@app.route("/newNotes", methods=['POST'])
def new_Notes():
    data = request.get_json()
    # print(data)
    
    cur = mysql.connection.cursor()
    cur.execute("CALL newNote(%s, %s, %s)", (data[0], data[1], data[2]))
    mysql.connection.commit()
    
    cur.close()
    
    return jsonify({"new note added": data})


@app.route("/deleteNote", methods=['POST'])
def deleteNote():
    noetkey = request.get_json()
    # print(noetkey)
    
    cur = mysql.connection.cursor()
    
    cur.execute(f"CALL deleteNote({noetkey})")
    mysql.connection.commit()
    
    cur.close()
    
    
    return jsonify({"delete key": noetkey})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)