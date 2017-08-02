from Tkinter import *
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.OUT)

steering = GPIO.PWM(18, 100)
steering.start(5);
throttle = GPIO.PWM(23, 100)
throttle.start(5);

class App:
    def __init__(self, master):
        frame = Frame(master)
        frame.pack();
        scale1 = Scale(frame, from_=0, to=180, orient=HORIZONTAL, command=self.updateSteering)
        scale1.grid(row=0)
        scale2 = Scale(frame, from_=0, to=180, orient=HORIZONTAL, command=self.updateThrottle)
        scale2.grid(row=1)

    def updateSteering(self, angle):
        duty = float(angle) / 10.0 + 2.5
        throttle.ChangeDutyCycle(duty)

    def updateThrottle(self, angle):
        duty = float(angle) / 10.0 + 2.5
        steering.ChangeDutyCycle(duty)


root = Tk()
root.wm_title('Servo Contol Test')
app = App(root)
root.geometry("200x100+0+0")
root.mainloop()

