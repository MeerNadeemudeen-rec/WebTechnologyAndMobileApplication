package com.example.emailsenderapp;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText email, subject, message;
    Button sendBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        email = findViewById(R.id.email);
        subject = findViewById(R.id.subject);
        message = findViewById(R.id.message);
        sendBtn = findViewById(R.id.sendBtn);

        sendBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                String to = email.getText().toString();
                String sub = subject.getText().toString();
                String msg = message.getText().toString();

                // Validation
                if (to.isEmpty() || sub.isEmpty() || msg.isEmpty()) {
                    Toast.makeText(MainActivity.this, "All fields required!", Toast.LENGTH_SHORT).show();
                    return;
                }

                // Email Intent
                Intent intent = new Intent(Intent.ACTION_SENDTO);
                intent.setData(Uri.parse("mailto:" + to));
                intent.putExtra(Intent.EXTRA_SUBJECT, sub);
                intent.putExtra(Intent.EXTRA_TEXT, msg);

                try {
                    startActivity(Intent.createChooser(intent, "Send Email"));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "No email app found!", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
}