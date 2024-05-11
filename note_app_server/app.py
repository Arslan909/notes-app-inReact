from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity,JWTManager, jwt_required

app = Flask(__name__)
CORS(app)
jwt = JWTManager(app)
# CORS(app, supports_credentials=True)


app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "myuser"
app.config["MYSQL_PASSWORD"] = "password123"
app.config["MYSQL_DB"] = "notes_app_3"


mysql = MySQL(app)
app.secret_key = 'not-so-secrete-huh'
session = dict()


@app.route("/")
def index():
    session.clear()
    return jsonify({"message": "hello form flask"})


@app.route("/login", methods=["POST"])
def login():
    loginData = request.get_json()
    uname = loginData['username']
    pwd = loginData['password']

    cur = mysql.connection.cursor()
    cur.execute("CALL checkLogin(%s, %s)", (uname, pwd))
    user_id = cur.fetchone()
    print(user_id)
    if user_id[0] != 0:
        session["user_id"] = user_id[0]
        access_token = create_access_token(identity=user_id[0])

        test = session["user_id"]
        return jsonify({"userId": test, "access_token":access_token }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@app.route("/signup", methods=["POST"])
def signup():
    loginData = request.get_json()
    fullName = loginData['fullName']
    uname = loginData['username']
    pwd = loginData['password']
    
    try:
        cur = mysql.connection.cursor()
        cur.callproc('signUp', (fullName, uname, pwd))
        result = cur.fetchall()

        cur.close()
        mysql.connection.commit()

        if result:
            status =  result[0][0]
            message = result[0][1]
            
            if status == "success":
                return jsonify({'message': message}), 200
            else:
                return jsonify({'error': message}), 409

    except Exception as e:
        return jsonify({'message': str(e)}), 500



@app.route("/getNotes", methods=["GET"])
def getData():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        print("exe this")
        userId = session["sharedId"]
        notes = getNotes(userId)
        folders = getFolder(userId)

        data = {"notes": notes, "folders": folders}

        return jsonify(data)
        
    else:
        userId = session["user_id"]
        notes = getNotes(userId)
        folders = getFolder(userId)

        data = {"notes": notes, "folders": folders}

        return jsonify(data)


# helper
def getNotes(userId):
    cur = mysql.connection.cursor()

    cur.execute("CALL getNotes(%s)", (userId,))
    notes = []
    for row in cur.fetchall():
        # print(row)
        note = {
            "noteId": row[0],
            "noteName": row[1],
            "noteDescription": row[2],
            "folder_id": row[3],
        }
        notes.append(note)

    cur.close()
    return notes


# helper
def getFolder(userId):
    cur = mysql.connection.cursor()

    cur.execute("CALL getFolders(%s)", (userId,))
    folders = []
    for row in cur.fetchall():
        # print(row)
        folder = {
            "folderId": row[0],
            "folderName": row[1],
        }
        folders.append(folder)

    cur.close()
    return folders


@app.route("/newNotes", methods=["POST"])
def new_Notes():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        data = request.get_json()
        print("exe this")
        userId = session["sharedId"]
        
        cur = mysql.connection.cursor()
        cur.execute(
            "CALL newNote(%s, %s, %s, %s)",
            (userId, data["noteName"], data["noteDescription"], data["folderId"]),
        )
        mysql.connection.commit()
        cur.close()

        return jsonify({"new note added": data})
    else:
        data = request.get_json()
        userId = session["user_id"]

        # data = { # sample test
        #     "noteName": "new Note",
        #     "noteDescription": "new note description...",
        #     "folderId": None,
        # }

        cur = mysql.connection.cursor()
        cur.execute(
            "CALL newNote(%s, %s, %s, %s)",
            (userId, data["noteName"], data["noteDescription"], data["folderId"]),
        )
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})


@app.route("/createFolder", methods=["POST"])
def createFolder():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        data = request.get_json()
        print("exe this")
        userId = session["sharedId"]
        cur = mysql.connection.cursor()
        cur.execute("CALL createFolder(%s, %s)", (userId, data["folderName"]))
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})
    else:
        data = request.get_json()
        userId = session["user_id"]

        # data = {"folderName": "untitled"} # sample

        cur = mysql.connection.cursor()
        cur.execute("CALL createFolder(%s, %s)", (userId, data["folderName"]))
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})


@app.route("/folderNote", methods=["POST"])
def newFolderNote():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        print("exe this")
        userId = session["sharedId"]
        
        cur = mysql.connection.cursor()
        cur.execute(
            "CALL newNote(%s, %s, %s, %s)",
            (userId, data["noteName"], data["noteDescription"], data["folderId"]),
        )
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})
    else:
        data = request.get_json()
        userId = session["user_id"]

        # data = { # sample
        #     "noteName": "new Note",
        #     "noteDescription": "new note description...",
        #     "folderId": 1,
        # }

        cur = mysql.connection.cursor()
        cur.execute(
            "CALL newNote(%s, %s, %s, %s)",
            (userId, data["noteName"], data["noteDescription"], data["folderId"]),
        )
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})


@app.route("/searchUser", methods=["POST"])
def searchUser():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        uname = request.args.get("username")

        cur = mysql.connection.cursor()
        cur.callproc("searchUser", [uname])
        results = cur.fetchall()

        return jsonify({"users": results}), 200


@app.route("/allUsers", methods=["GET"])
def allUsers():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:

        cur = mysql.connection.cursor()
        cur.callproc("allUsers")
        results = cur.fetchall()
        users = []
        for res in results:
            temp = {"userID": res[0], "userEmail": res[1]}
            users.append(temp)

        # print(users)

        return jsonify({"users": users}), 200


@app.route("/sendInvitation", methods=["POST"])
def sendInvitation():
    if len(session) == 0:
        return jsonify({"message": "Not logged in"}), 404
    else:
        try:
            invitationData = request.json
            sender = session["user_id"]
            receiver = invitationData["reciever"]
            status = "pending"
            privilege = invitationData["privilege"]

            if sender is None or receiver is None or privilege is None:
                return jsonify({"message": "Missing required parameters"}), 400
            
            if sender == receiver:
                return jsonify({"message": "sender and reciver cant be same"}), 400

            cur = mysql.connection.cursor()
            cur.execute("CALL sendNotification(%s, %s, %s, %s)",(sender, receiver, status, privilege))
            mysql.connection.commit()

            return jsonify({"message": "Invitation sent successfully"}), 200
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500
        
        
@app.route("/notificationAlert", methods=["POST"])
def notificationAlert():
    if len(session) == 0:
        return jsonify({"message": "Not logged in"}), 404
    else:
        try:
            userId = session["user_id"]

            cur = mysql.connection.cursor()
            cur.execute("CALL notificationAlert(%s)",(userId,))
            temp = cur.fetchall()
            notifcations = []
            for entry in temp:
                notification = {
                    "senderId":entry[0],
                    "senderUsername":entry[1]
                }
                notifcations.append(notification)

            return jsonify({"notifications": notifcations}), 200
        except Exception as e:
            print(e)
            return jsonify({"message": "A server error occurred"}), 500

        
@app.route("/acceptInvitation", methods=["POST"])
def acceptInvitation():
    if len(session) == 0:
        return jsonify({"message": "Not logged in"}), 404
    else:
        try:
            invitationData = request.json
            receiver = session["user_id"]
            sender = invitationData.get("senderId")
            print(sender)

            if sender is None or receiver is None:
                return jsonify({"message": "Missing required parameters"}), 400
            
            if sender == receiver:
                return jsonify({"message": "Sender and receiver can't be the same"}), 400
            

            cur = mysql.connection.cursor()
            cur.execute("CALL acceptInvitation(%s, %s)", (sender, receiver))
            mysql.connection.commit()

            return jsonify({"message": "Invitation accepted successfully"}), 200
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500

        
@app.route("/rejectInvitation", methods=["POST"])
def rejectInvitation():
    if len(session) == 0:
        return jsonify({"message": "Not logged in"}), 404
    else:
        try:
            invitationData = request.json
            receiver = session["user_id"]
            sender = invitationData.get("senderId")

            if sender is None or receiver is None:
                return jsonify({"message": "Missing required parameters"}), 400
            
            if sender == receiver:
                return jsonify({"message": "Sender and receiver can't be the same"}), 400

            cur = mysql.connection.cursor()
            cur.execute("CALL rejectInvitation(%s, %s)", (sender, receiver))
            mysql.connection.commit()

            return jsonify({"message": "Invitation rejected successfully"}), 200
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500


# @app.route("/getTeamSpaces", methods=["GET"])
# def getTeamSpaces():
#     if len(session) == 0:
#         return jsonify({"error": "Not logged in"}), 404
#     else:
#         try:
#             userId = session["user_id"]
            
#             defaultProfile = getDefaultProfile(userId)
#             sharedProfiles = getSharedSpaces(userId)

#             data = {"defaultProfile": defaultProfile, "sharedProfiles": sharedProfiles}

#             return jsonify(data),200
        
#         except Exception as e:
#             print(e)
#             return jsonify({"message": "A server error occurred"}), 500  

@app.route("/getDefaultProfile", methods=["GET"])
def getDefaultProfile():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        try:
            userId = session["user_id"]
            
            cur = mysql.connection.cursor()
            cur.execute("CALL defaultProfile(%s)", (userId,))
            defaultProfile = []
            for entry in cur.fetchall():
                defaultProfile.append({
                    "userId":entry[0],
                    "userEmail":entry[1]
                })
            
            # print(defaultProfile)
            return jsonify({"defaultProfile": defaultProfile})
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500

@app.route("/getSharedSpaces", methods=["GET"])
def getSharedSpaces():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        try:
            userId = session["user_id"]
            
            cur = mysql.connection.cursor()
            cur.execute("CALL sharedSpaces(%s)", (userId,))
            sharedProfiles = []
            for entry in cur.fetchall():
                sharedProfiles.append({
                        "userId":entry[0],
                        "userEmail":entry[1],
                        "userPrivilege":entry[2]
                    })
                
            # print(sharedProfiles)
            return jsonify({"sharedProfiles": sharedProfiles})
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500  


@app.route("/shiftWorkspace", methods=["POST"])
def shiftWorkspace():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    else:
        try:
            
            profileId = request.json
            # print(profileId["userId"])
            userId = session["user_id"]
            if(profileId["userId"] == userId):
                del session["sharedId"]
            else:
                session["sharedId"] = profileId["userId"]
                
            return jsonify({"message": f"workspace shifited to ${profileId}"})
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500  
        
        

@app.route("/deleteNote", methods=["POST"])
def deleteNote():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        request_data = request.get_json()
        print("exe this")
        userId = session["sharedId"]
        
        noteId = request_data["noteId"]
        
        cur = mysql.connection.cursor()

        cur.execute("CALL deleteNote(%s, %s)", (userId, noteId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted note ID ": noteId})    
    else:
        request_data = request.get_json()
        userId = session["user_id"]
        noteId = request_data["noteId"]

        cur = mysql.connection.cursor()

        cur.execute("CALL deleteNote(%s, %s)", (userId, noteId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted note ID ": noteId})


@app.route("/deleteFolder", methods=["POST"])
def deleteFolder():
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        request_data = request.get_json()
        print("exe this")
        userId = session["sharedId"]
        
        folderId = request_data["folderId"]

        cur = mysql.connection.cursor()

        cur.execute("CALL deleteFolder(%s, %s)", (userId, folderId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted folder ID ": folderId})
    else:
        request_data = request.get_json()
        userId = session["user_id"]
        folderId = request_data["folderId"]

        cur = mysql.connection.cursor()

        cur.execute("CALL deleteFolder(%s, %s)", (userId, folderId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted folder ID ": folderId})


@app.route("/updateNoteDescription", methods=["POST"])
def updateNoteDescription():
    try:
        data = request.json
        if len(session) == 0:
            return jsonify({"error": "Not logged in"}), 404
        elif "sharedId" in session:
            userId = session["sharedId"]
            noteId = data.get("noteId")
            noteDescription = data.get("noteDescription")
            
            
            if noteId is None or noteDescription is None:
                return jsonify({"error": "Missing noteId or noteDescription in request"}), 400
            
            cur = mysql.connection.cursor()
            cur.execute("CALL UpdateNoteDescription(%s, %s, %s)", (noteId, userId, noteDescription))
            mysql.connection.commit()
            cur.close()

            return jsonify({"message": "Note description updated successfully"}), 200
        else:
            userId = session["user_id"]
            noteId = data.get("noteId")
            noteDescription = data.get("noteContent")
            
            print(userId)
            print(noteId)
            print(noteDescription)

            if noteId is None or noteDescription is None:
                return jsonify({"error": "Missing noteId or noteDescription in request"}), 400
            

            cur = mysql.connection.cursor()
            cur.execute("CALL UpdateNoteDescription(%s, %s, %s)", (noteId, userId, noteDescription))
            mysql.connection.commit()
            cur.close()

            return jsonify({"message": "Note description updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/searchNotes", methods=["POST"])
def search_notes():
    search_query = request.json.get('searchQuery')
    if len(session) == 0:
        return jsonify({"error": "Not logged in"}), 404
    elif "sharedId" in session:
        try:
            userId = session["sharedId"]
            cur = mysql.connection.cursor()
            cur.execute('Call searchNotes(%s, %s)', (search_query,userId))
            notes = []
            for row in cur.fetchall():
                note = {
                    "noteId": row[0],
                    "noteName": row[1],
                    "noteDescription": row[2],
                    "folder_id": row[3],
                }
                notes.append(note)
            return jsonify({'notes': notes}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        try:
            userId = session["user_id"]
            cur = mysql.connection.cursor()
            cur.execute('Call searchNotes(%s, %s)', (search_query,userId))
            notes = []
            for row in cur.fetchall():
                note = {
                    "noteId": row[0],
                    "noteName": row[1],
                    "noteDescription": row[2],
                    "folder_id": row[3],
                }
                notes.append(note)
                
            # print(notes)
            return jsonify({'notes': notes}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    
@app.route("/logout")
def logout():
    session.clear()
    return jsonify({"message": "logout success"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
