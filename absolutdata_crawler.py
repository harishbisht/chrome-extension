#!/usr/bin/python
import json
import requests
from urllib import urlencode
from datetime import datetime
import os, time, sys

month = datetime.today().month

def get_details(userid, password, only_validate=False, linux_popup=False):
    try:
        # starting session 
        login_url = "https://thehub.absolutdata.com/pm/Login.aspx"
        s = requests.session()
        s.get(login_url)

        payload = {"Button1":"Submit",
                    "__EVENTVALIDATION":"/wEdAAWovda5xpO4Z6c1FPk8GQDEKhoCyVdJtLIis5AgYZ/RYe4sciJO3Hoc68xTFtZGQEjN+DvxnwFeFeJ9MIBWR693Y4gqsEuo3McwZ5PSVhdsIPHAa1ZHNa3y9CgeZPQtK8x6zCAxcSRZTkabPcIf43v+",
                    "__VIEWSTATE":"/wEPDwUKLTI0NjIxNzc4OGRknVMyEQdHtdZMZ47xqzivNvUS9JKafYtDPFpI6JtlpoU=",
                    "__VIEWSTATEGENERATOR":"4BB762C6",
                    "password":password,
                    "username":userid}

        headers = {
            'origin': "https://thehub.absolutdata.com",
            'upgrade-insecure-requests': "1",
            'content-type': "application/x-www-form-urlencoded",
            'user-agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
            'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            'accept-encoding': "gzip, deflate, br",
            'accept-language': "en-US,en;q=0.9,gu;q=0.8,hi;q=0.7",
            }
        payload = urlencode(payload)
        response = s.post(login_url, data=payload, headers=headers)
        if only_validate:
            return {"validated": response.cookies.values() == []}
        # request to attendance page
        url = "https://thehub.absolutdata.com/pm/Handlers/Attendance.ashx"
        payload = "Month=%s&todo=GetEmployeeAttendance"%(month)
        headers = {
            'accept': "application/json, text/javascript, */*; q=0.01",
            'origin': "https://thehub.absolutdata.com",
            'x-requested-with': "XMLHttpRequest",
            'user-agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
            'content-type': "application/x-www-form-urlencoded",
            'referer': "https://thehub.absolutdata.com/pm/TransactionForms/Attendance.aspx",
            'accept-encoding': "gzip, deflate, br",
            'accept-language': "en-US,en;q=0.9,gu;q=0.8,hi;q=0.7",
            # 'cookie': "ASP.NET_SessionId=mvhb3y4jt4dm0vljytl15z0n; myCookie=; _ga=GA1.2.815934818.1536752742",
            'cache-control': "no-cache",
            }
        response = json.loads(s.post(url, data=payload, headers=headers).text)
        # print response[-1]
        # print "Attendance of Date: " + response[-1]['Attendance of Date']
        # print "Employee Name: " + response[-1]['Employee Name']
        # print "Time In: " +  response[-1]["Time In"]

        # calculating the total time in office
        # time before fingerprint log
        if response[-1]["Time In"]=="NA":
            return {"datetime":"NA"}
        enterdatetime = response[-1]["Date In"] + "T" + response[-1]["Time In"]
        enterdatetime_obj = datetime.strptime(enterdatetime, "%d-%m-%YT%H:%M:%S")
        total_time_in_office = str(datetime.now() - enterdatetime_obj)
        total_time_in_office = total_time_in_office.split(".")[0]
        # print "Total time in office: " + total_time_in_office

        d = {"AttendanceDate": "Attendance of Date: " + response[-1]['Attendance of Date'],
            "EmployeeName": "Employee Name: " + response[-1]['Employee Name'],
            "TimeIn": "Time In: " +  response[-1]["Time In"],
            "TotalTimeInOffice": "Total Time in Office: " + total_time_in_office,
            "datetime":enterdatetime_obj.isoformat()}
        if linux_popup:
            # for linux notification
            command = '''notify-send  "Employee Name: %s" "%s"''' %(response[-1]['Employee Name'],d["TotalTimeInOffice"])
            print os.system(command)
        else:
            return d
    except:
        return {"err":"incorrect credentials"}
        



if __name__ == "__main__":
    pass