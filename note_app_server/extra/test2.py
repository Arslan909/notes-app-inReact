from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_mysqldb import MySQL

from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user

app = Flask(__name__)
# CORS(app)
CORS(app, supports_credentials=True)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'myuser'
app.config['MYSQL_PASSWORD'] = 'password123'
app.config['MYSQL_DB'] = 'notes_app_test'

# Session configuration
app.config['SESSION_COOKIE_SECURE'] = False 
app.config['SESSION_TYPE'] = 'filesystem'


mysql = MySQL(app)
app.secret_key = 'not-so-secrete-huh'
login_manager = LoginManager(app)
login_manager.init_app(app)

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


@app.route("/login", methods=['POST'])
def login():
    loginData = request.get_json()
    uname = loginData['username']
    pwd = loginData['password']
    # session.clear()
    
    cur = mysql.connection.cursor()
    cur.execute("CALL checkLogin(%s, %s)", (uname, pwd))
    user_id = cur.fetchone()
    print("succes")
    
    if user_id:
        user = User(user_id[0])
        login_user(user)
        
        session['user_id'] = user_id[0]
        print(session)
        test = current_user.id
        return jsonify({"userId": test}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 404


    
@app.route("/protected", methods=['GET'])
# @login_required
def protected_route():
    user_id = session.get('user_id')
    print(user_id)
    print(session)
    return jsonify({"message": "This is a protected route."}), 200
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)