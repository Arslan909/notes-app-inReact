# def kmp(string, key):
#     lps = [0] * len(key)

#     prevLps = 0
#     i = 1

#     while i < len(key):
#         if key[i] == key[prevLps]:
#             lps[i] = prevLps + 1
#             prevLps += 1
#             i += 1
#         elif prevLps == 0:
#             lps[i] = 0
#             i += 1
#         else:
#             prevLps = lps[prevLps - 1]

#     i, j = 0, 0

#     while i < len(string):
#         if j == len(key):
#             return i - len(key)

#         if string[i] == key[j]:
#             i += 1
#             j += 1
#         else:
#             if j == 0:
#                 i += 1
#             else:
#                 j = lps[j - 1]
#     return -1


# string = "aaaxa"
# key = "aaaa"

# res =kmp(string, key)
# print(res)




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
    
    for string in stringArr:
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
              foundArr.append(string)
              break
    return foundArr


# string = "aaaxaaaaa"
stringArr = ["aaaxaaaa a xaxaxax","aa aa a", "aaaa a", "xxxx", "axaxax a a a a", "aaaaaaa aaaaaaaaa"]
key = "aaaa a"
res =kmp(stringArr, key)
print(res)










# @app.route("/searchFileContent", methods=["POST"])
# @jwt_required()
# def searchFileContent():
#     data = request.get_json()
#     searchQuery = data["searchQuery"]
#     userId =  get_jwt_identity()
    
#     try:
#         cur = mysql.connection.cursor()
#         cur.execute("SELECT ID, noteName, NoteDescription FROM Notes WHERE userId = %s", (userId,))
#         res = cur.fetchall()
#         # print(res)
        
#         stringArr = []
#         for ele in res:
#             stringArr.append(ele[2])
        
#         # print(stringArr)
#         foundArr = kmp(stringArr, searchQuery)
#         print(foundArr)
        
#         return jsonify({"message": foundArr})
    
#     except Exception as e:
#         return jsonify({"message": f"error occured in execution ${e}"}), 500


    
# # helper 
# def kmp(stringArr, key):
#     lps = [0] * len(key)

#     prevLps = 0
#     i = 1

#     while i < len(key):
#         if key[i] == key[prevLps]:
#             lps[i] = prevLps + 1
#             prevLps += 1
#             i += 1
#         elif prevLps == 0:
#             lps[i] = 0
#             i += 1
#         else:
#             prevLps = lps[prevLps - 1]

    
#     foundArr = []
    
#     for string in stringArr:
#       i, j = 0, 0
    
#       while i < len(string):

#           if string[i] == key[j]:
#               i += 1
#               j += 1
#           else:
#               if j == 0:
#                   i += 1
#               else:
#                   j = lps[j - 1]
          
#           if j == len(key):
#               foundArr.append(string)
#               break
#     return foundArr  
 