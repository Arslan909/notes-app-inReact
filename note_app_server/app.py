from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity,JWTManager, jwt_required
from datetime import timedelta, datetime

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
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)


@app.route("/")
def index():
    # session.clear()
    return jsonify({"message": "hello form flask"})


@app.route("/login", methods=["POST"])
def login():
    loginData = request.get_json()
    uname = loginData['username']
    pwd = loginData['password']
    cur = mysql.connection.cursor()
    cur.execute("CALL checkLogin(%s, %s)", (uname, pwd))
    user_id = cur.fetchone()
    if user_id and user_id[0] != 0:
        access_token = create_access_token(identity=user_id[0])
        return jsonify({"access_token": access_token}), 200
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
@jwt_required()
def getData():
    if "sharedId" in session:
        print("exe this")
        userId = session["sharedId"]
        notes = getNotes(userId)
        folders = getFolder(userId)

        data = {"notes": notes, "folders": folders}

        return jsonify(data) 
    else:
        userId =  get_jwt_identity()
        
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
@jwt_required()
def new_Notes():
    if "sharedId" in session:
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
        userId =  get_jwt_identity()
        

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
@jwt_required()
def createFolder():
    if "sharedId" in session:
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
        userId =  get_jwt_identity()
        

        # data = {"folderName": "untitled"} # sample

        cur = mysql.connection.cursor()
        cur.execute("CALL createFolder(%s, %s)", (userId, data["folderName"]))
        mysql.connection.commit()

        cur.close()

        return jsonify({"new note added": data})


@app.route("/folderNote", methods=["POST"])
@jwt_required()
def newFolderNote():
    if "sharedId" in session:
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
        userId =  get_jwt_identity()
        

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
@jwt_required()
def searchUser():
    uname = request.args.get("username")

    cur = mysql.connection.cursor()
    cur.callproc("searchUser", [uname])
    results = cur.fetchall()

    return jsonify({"users": results}), 200


@app.route("/allUsers", methods=["GET"])
@jwt_required()
def allUsers():
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
@jwt_required()
def sendInvitation():
    try:
        invitationData = request.json
        sender =  get_jwt_identity()
        # sender = session["user_id"]
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
@jwt_required()
def notificationAlert():
        try:
            userId =  get_jwt_identity()
            

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
@jwt_required()
def acceptInvitation():
    
        try:
            invitationData = request.json
            receiver =  get_jwt_identity()
            # receiver = session["user_id"]
            sender = invitationData.get("senderId")
            # print(sender)

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
@jwt_required()
def rejectInvitation():
    
        try:
            invitationData = request.json
            receiver =  get_jwt_identity()
            # receiver = session["user_id"]
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


@app.route("/getDefaultProfile", methods=["GET"])
@jwt_required()
def getDefaultProfile():
    
        try:
            
            userId =  get_jwt_identity()
            
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
@jwt_required()
def getSharedSpaces():
    
        try:
            
            userId =  get_jwt_identity()
            
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
@jwt_required()
def shiftWorkspace():
        try:
            profileId = request.json
            
            userId =  get_jwt_identity()
            if(profileId["userId"] == userId):
                del session["sharedId"]
            else:
                session["sharedId"] = profileId["userId"]
                
            return jsonify({"message": f"workspace shifited to ${profileId}"})
        except Exception as e:
            print(e)
            return jsonify({"message": "An unexpected error occurred"}), 500  
        
        

@app.route("/deleteNote", methods=["POST"])
@jwt_required()
def deleteNote():
    if "sharedId" in session:
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
        
        userId =  get_jwt_identity()
        noteId = request_data["noteId"]

        cur = mysql.connection.cursor()

        cur.execute("CALL deleteNote(%s, %s)", (userId, noteId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted note ID ": noteId})


@app.route("/deleteFolder", methods=["POST"])
@jwt_required()
def deleteFolder():
    if "sharedId" in session:
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
        
        userId =  get_jwt_identity()
        folderId = request_data["folderId"]

        cur = mysql.connection.cursor()

        cur.execute("CALL deleteFolder(%s, %s)", (userId, folderId))
        mysql.connection.commit()

        cur.close()

        return jsonify({"deleted folder ID ": folderId})


@app.route("/updateNoteDescription", methods=["POST"])
@jwt_required()
def updateNoteDescription():
    try:
        data = request.json
        if "sharedId" in session:
            userId = session["sharedId"]
            noteId = data.get("noteId")
            noteDescription = data.get("noteContent")
            noteTitle = data.get("note_Title")
            
            if noteId is None or noteDescription is None:
                return jsonify({"error": "Missing noteId or noteDescription in request"}), 400
            
            cur = mysql.connection.cursor()
            cur.execute("CALL UpdateNoteDescription(%s, %s, %s, %s)", (noteId, userId, noteDescription, noteTitle))
            mysql.connection.commit()
            cur.close()

            return jsonify({"message": "Note description updated successfully"}), 200
        else:
            
            userId =  get_jwt_identity()
            noteId = data.get("noteId")
            noteDescription = data.get("noteContent")
            noteTitle = data.get("note_Title")
            
            print(userId)
            print(noteId)
            print(noteDescription)
            print(noteTitle)

            if noteId is None or noteDescription is None:
                return jsonify({"error": "Missing noteId or noteDescription in request"}), 400
            

            cur = mysql.connection.cursor()
            cur.execute("CALL UpdateNoteDescription(%s, %s, %s, %s)", (noteId, userId, noteDescription, noteTitle))
            mysql.connection.commit()
            cur.close()

            return jsonify({"message": "Note description updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/searchNotes", methods=["POST"])
@jwt_required()
def search_notes():
    search_query = request.json.get('searchQuery')
    if "sharedId" in session:
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
            
            userId =  get_jwt_identity()
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

@app.route("/leaveWorkspace", methods=["POST"])
@jwt_required()
def leaveWorkspace():
    profileData = request.get_json()
    # print(profileData)
    
    userId =  get_jwt_identity()
    leavingProfile = profileData["userId"]
    
    if leavingProfile == "":
        return jsonify({"message": "no profile id given"})
    
    try:
        
        cur = mysql.connection.cursor()
        print(leavingProfile)
        cur.execute("CALL leaveWorkspace(%s, %s)", (leavingProfile, userId))  # check order before making any change Important
        mysql.connection.commit()
        return jsonify({"message": "work space is removed"}), 200
        
    except Exception as e:
        return jsonify({"message": "An unexpected error occurred"}), 500  


# bookmar shite - front end todo
@app.route("/addBookmark", methods=["POST"])
@jwt_required()
def addBookmark():
    data = request.get_json()
    userId =  get_jwt_identity()
    noteId = data["noteId"]
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("CAll AddBookmark(%s, %s)", (userId, noteId))
        mysql.connection.commit()
        return jsonify({"message": "bookmark added"}), 200
    
    except Exception as e:
        return jsonify({"message": "An unexpected error occurred"}), 500 

@app.route("/removeBookmark", methods=["POST"])
@jwt_required()
def removeBookmark():
    data = request.get_json()
    userId =  get_jwt_identity()
    noteId = data["noteId"]
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("Call DeleteBookmark(%s, %s)", (userId, noteId))
        mysql.connection.commit()
        return jsonify({"message": "bookmark removed"}), 200
    
    except Exception as e:
        return jsonify({"message": "An unexpected error occurred"}), 500
    
    

@app.route('/getBookmarkedNotes', methods=['GET'])
@jwt_required()
def get_bookmarked_notes():
    userId =  get_jwt_identity()
    try:
        cur = mysql.connection.cursor()
        cur.execute("CALL getBookmarkedNotes(%s)", (userId,))
        notes = []
        for row in cur.fetchall():
            note = {
                "noteId": row[0],
                "noteName": row[1],
                "noteDescription": row[2],
                "folder_id": row[3],
            }
            notes.append(note)
        cur.close()
        return jsonify({'notes': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500  
    
     
@app.route('/getBookmarkedId', methods=['GET'])
@jwt_required()
def getBookmarkedId():
    userId =  get_jwt_identity()
    try:
        cur = mysql.connection.cursor()
        cur.execute("select noteId from Bookmarks where userId = %s", (userId,))
        notes = cur.fetchall()
        cur.close()
        note_ids = [note[0] for note in notes]
        print(note_ids)
        return ( note_ids), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500   



# weekly planner shite
@app.route("/addTask", methods=["POST"])
@jwt_required()
def addTask():
    data = request.get_json()
    userId =  get_jwt_identity()
    
    taskContent = data["taskContent"]
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("Call addTask(%s, %s)", (userId, taskContent))
        mysql.connection.commit()
        return jsonify({"message": f"task added to list for user ${userId}"}), 200
    
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred ${e}"}), 500
    
@app.route("/getTask", methods=["GET"])
@jwt_required()
def getTask():
    userId = get_jwt_identity()

    try:
        cur = mysql.connection.cursor()
        cur.execute("CALL getTask(%s)", (userId,))
        todoTask = []
        for row in cur.fetchall():
            temp = {
                'id': row[0],
                'user_id': row[1],
                'taskContent': row[2],
                'created_at': row[3],
                'status': row[4]
            }
            todoTask.append(temp)

        return jsonify(todoTask), 200
    except Exception as e:
        return jsonify({"message": f"Error occurred in execution {e}"}), 500

    
@app.route("/deleteTask", methods=["POST"])
@jwt_required()
def deleteTask():
    data = request.get_json()
    taskId = data["taskId"]
    userId =  get_jwt_identity()
    
    try:
        print("chal ja ")
        cur = mysql.connection.cursor()
        cur.execute("call deleteTask(%s,%s)",(userId, taskId))
        mysql.connection.commit()

        return jsonify({"message": "task is deleted from list"}), 200
 
    except Exception as e:
        return jsonify({"message": f"error occured in execution ${e}"}), 500


@app.route("/updateTaskStatus", methods=["POST"])
@jwt_required()
def updateTaskStatus():
    data = request.get_json()
    taskId = data["taskId"]
    userId = get_jwt_identity()

    try:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE Task SET status = %s WHERE id = %s AND userId = %s", ('done', taskId, userId))
        mysql.connection.commit()

        return jsonify({"message": "Task status updated to done"}), 200
    except Exception as e:
        return jsonify({"message": f"Error occurred in execution {e}"}), 500
     



@app.route("/getWeeklyReport", methods=["GET"])
@jwt_required()
def getWeeklyReport():
    def get_week_of_year(date):
        start_date = datetime(date.year, 1, 1)
        days = (date - start_date).days
        return (days + start_date.weekday()) // 7 + 1

    userId = get_jwt_identity()

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT userId, taskContent, created_at, status FROM Task WHERE userId = %s", (userId,))
        report = []
        for row in cur.fetchall():
            temp = {
                'userId': row[0],
                'taskContent': row[1],
                'taskDate': row[2],
                'status': row[3]
            }
            report.append(temp)
        cur.close()

        # Calculate completion percentage per week
        weeks_in_year = 52
        total_counts = [0] * weeks_in_year
        completed_counts = [0] * weeks_in_year

        for task in report:
            task_date = task['taskDate']
            week = get_week_of_year(task_date) - 1
            total_counts[week] += 1
            if task['status'] == 'done':
                completed_counts[week] += 1

        completion_percentages = [
            (completed_counts[i] / total_counts[i] * 100) if total_counts[i] > 0 else 0
            for i in range(weeks_in_year)
        ]

        return jsonify({"completionPercentages": completion_percentages}), 200
    except Exception as e:
        return jsonify({"message": f"Error occurred in execution: {str(e)}"}), 500



     
     
@app.route("/searchFileContent", methods=["POST"])
@jwt_required()
def searchFileContent():
    data = request.get_json()
    searchQuery = data["searchQuery"]
    userId =  get_jwt_identity()
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT ID, noteName, NoteDescription FROM Notes WHERE userId = %s", (userId,))
        res = []
        for row in cur.fetchall():
            temp={
                "iD":row[0],
                "noteName":row[1],
                "noteDescription":row[2]
            }
            res.append(temp)
            
        foundArr = kmp(res, searchQuery)
        # print(foundArr)
        
        return jsonify({"message": foundArr})
    
    except Exception as e:
        return jsonify({"message": f"error occured in execution ${e}"}), 500


    
# helper 
def kmp(stringArr, key):
    lps = [0] * len(key)

    prevLps = 0
    i = 1

    while i < len(key):
        if key[i] == key[prevLps]:
            lps[i] = prevLps + 1
            prevLps += 1
            i += 1
        elif prevLps == 0:
            lps[i] = 0
            i += 1
        else:
            prevLps = lps[prevLps - 1]

    
    foundArr = []
    
    for obj in stringArr:
        string = obj["noteDescription"]
        i, j = 0, 0
    
        while i < len(string):

            if string[i] == key[j]:
                i += 1
                j += 1
            else:
                if j == 0:
                    i += 1
                else:
                    j = lps[j - 1]
            
            if j == len(key):
                foundArr.append(obj)
                break
            
    return foundArr
 
 
 
 

@app.route("/renameFolder", methods=["POST"])
@jwt_required()
def renameFolder():
    data = request.json
    
    if "sharedId" in session:
        userId = session["sharedId"]
    else:
        userId = get_jwt_identity()
    
    try:
        folderId = data.get("folderId")
        folderName = data.get("folderName")
            
        if not folderName or not folderId:
            return jsonify({"error": "Missing folderId or folderName"}), 400

        cur = mysql.connection.cursor()
        cur.execute("CALL RenameFolder(%s, %s, %s)", (userId, folderId, folderName))
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Folder name updated successfully"}), 200
    
    except Exception as e:
        return jsonify({"message": f"Error occurred in execution {e}"}), 500    
    
    
    
    
    
@app.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"message": "logout success"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
