import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // Hardcoded credentials
        if ("admin".equals(username) && "1234".equals(password)) {

            // Create session
            HttpSession session = request.getSession();
            session.setAttribute("username", username);

            // Session timeout: 5 minutes
            session.setMaxInactiveInterval(300);

            response.sendRedirect("welcome.jsp");

        } else {
            out.println("<h3 style='color:red'>Invalid Username or Password</h3>");
            request.getRequestDispatcher("login.html").include(request, response);
        }
    }
}