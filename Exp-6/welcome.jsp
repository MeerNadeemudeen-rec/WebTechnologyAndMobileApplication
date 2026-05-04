<%@ page session="true" %>
<%
    String user = (String) session.getAttribute("username");

    if (user == null) {
        response.sendRedirect("login.html");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
</head>
<body>
    <h2>Welcome <%= user %>!</h2>
    <p>You are successfully logged in.</p>

    <a href="logout">Logout</a>
</body>
</html>