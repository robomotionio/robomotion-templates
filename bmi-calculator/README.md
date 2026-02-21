# BMI Calculator

BMI Calculator is a beginner friendly automation that computes your Body Mass Index from simple weight and height inputs. Built with Robomotion's input dialogs and basic math operations, it demonstrates how to collect user data, process it, and display results all within a single flow.

Whether you are learning how Robomotion flows work or need a quick health metric check, this template walks you through the fundamentals of user interaction and variable handling in a straightforward way.

## What BMI Calculator can do

- Prompt the user for weight in kilograms and height in centimeters
- Calculate BMI using the standard formula weight divided by height in meters squared
- Round the result to two decimal places for readability
- Display the final BMI value in a dialog box

## Behind the scenes

The flow opens two input dialogs, one for weight (default 70 kg) and one for height (default 170 cm). A Function node applies the standard BMI formula `weight / (height/100)^2`, rounds the result to two decimal places, and passes it to a message box that displays the calculated value. No external packages or configuration needed.
