package com.example.calculatorapp;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    EditText editTextNumber1, editTextNumber2;
    Button buttonAdd, buttonSubtract, buttonMultiply, buttonDivide, buttonClear;
    TextView textViewResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Link XML elements with Java code
        editTextNumber1 = findViewById(R.id.editTextNumber1);
        editTextNumber2 = findViewById(R.id.editTextNumber2);
        buttonAdd = findViewById(R.id.buttonAdd);
        buttonSubtract = findViewById(R.id.buttonSubtract);
        buttonMultiply = findViewById(R.id.buttonMultiply);
        buttonDivide = findViewById(R.id.buttonDivide);
        buttonClear = findViewById(R.id.buttonClear);
        textViewResult = findViewById(R.id.textViewResult);

        // Add button logic
        buttonAdd.setOnClickListener(view -> calculate('+'));

        // Subtract button logic
        buttonSubtract.setOnClickListener(view -> calculate('-'));

        // Multiply button logic
        buttonMultiply.setOnClickListener(view -> calculate('*'));

        // Divide button logic
        buttonDivide.setOnClickListener(view -> calculate('/'));

        // Clear button logic
        buttonClear.setOnClickListener(view -> {
            editTextNumber1.setText("");
            editTextNumber2.setText("");
            textViewResult.setText("Result will appear here");
        });
    }

    private void calculate(char operator) {
        String input1 = editTextNumber1.getText().toString();
        String input2 = editTextNumber2.getText().toString();

        if (input1.isEmpty() || input2.isEmpty()) {
            textViewResult.setText("Please enter both numbers.");
            return;
        }

        try {
            double num1 = Double.parseDouble(input1);
            double num2 = Double.parseDouble(input2);
            double result = 0;

            switch (operator) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '*':
                    result = num1 * num2;
                    break;
                case '/':
                    if (num2 == 0) {
                        textViewResult.setText("Cannot divide by zero");
                        return;
                    }
                    result = num1 / num2;
                    break;
            }

            textViewResult.setText("Result: " + result);
        } catch (NumberFormatException e) {
            textViewResult.setText("Invalid input");
        }
    }
}
