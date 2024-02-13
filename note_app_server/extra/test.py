from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_mysqldb import MySQL

from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin

app = Flask(__name__)
CORS(app)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'myuser'
app.config['MYSQL_PASSWORD'] = 'password123'
app.config['MYSQL_DB'] = 'notes_app_test'

# Session configuration
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_TYPE'] = 'filesystem'

mysql = MySQL(app)
app.secret_key = 'not-so-secrete-huh'
login_manager = LoginManager(app)
login_manager.init_app(app)

# User model# User model
# User model
class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)


@app.route("/message")
def index():
    return jsonify({"message": "hello form flask"})


@app.route("/getNotes", methods=['POST'])
@login_required
def getNotes():

    userId = request.get_json()
    print(userId)
    
    cur = mysql.connection.cursor()
    
    cur.execute("CALL getNotes(%s)", (userId,))
    notes = cur.fetchall()
    
    
    cur.close()
    return jsonify({"notes": "test"})


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


@app.route("/login", methods=['POST'])
def login():
    loginData = request.get_json()
    uname = loginData['username']
    pwd = loginData['password']
    
    cur = mysql.connection.cursor()
    cur.execute("CALL checkLogin(%s, %s)", (uname, pwd))
    user_id = cur.fetchone()

    if user_id:
        user = User(user_id[0])
        login_user(user)
        session['userId'] = user_id[0]
        print(session)
        return jsonify({"userId": user_id[0]}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 404
    
    
    
@app.route("/protected", methods=['POST'])
@login_required
def protected():
    user_id = User.id

    cur = mysql.connection.cursor()
    cur.execute("CALL getNotes(%s)", (user_id,))
    notes = cur.fetchall()
    cur.close()
    
    return jsonify({"notes": notes})
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)