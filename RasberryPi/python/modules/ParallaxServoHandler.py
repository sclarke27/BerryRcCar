
import math
import operator
import ParallaxServoController

class ParallaxServoHandler():

    def __init__(self, servoController):
        self.servo = servoController

    """
    Nastavi servam pociatocnu poziciu
    """
    def setHomePosition(self, rate):
        if self.servo.getServoPos(3) > 0 and self.servo.getServoPos(0) > 90:
            self.servo.setServoPos(0, 170, rate+10)
            self.servo.setServoPos(2, 152, rate+25)
            self.servo.setServoPos(3, 0, rate+25)
            self.servo.setServoPos(1, 90, rate+5)
        else:        
            self.servo.setServoPos(3, 0, rate+25)
            self.servo.setServoPos(0, 170, rate+10)
            self.servo.setServoPos(2, 152, rate+25)
            self.servo.setServoPos(1, 90, rate+5)


    def setX(self, x):
        self.x = x

    def setY(self, y):
        self.y = y

    def setZ(self, z):
        self.z = z
    
    def setLengthA(self, a):
        self.a = a

    def setLengthB(self, b):
        self.b = b
        
    def setLengthC(self, c):
        self.c = c

    """
    1 - otacanie        -       - 90
    0 - stredne rameno  - y     - 170
    2 - horne rameno    - z     - 152
    3 - spodne rameno   - x     - 0 
    
    Najde a nastavi serva na zadanu poziciu
    """
    def findPosition(self):
        
        a = self.a
        b = self.b
        ed = self.c
        
        x = self.x
        y = self.y
        z = self.z
    
        xt = x
        l = math.sqrt(x**2 + y**2)
        tn = math.atan(operator.truediv(y, x))

        x = l
        z = z + ed
        c = math.sqrt(x**2 + z**2)
        
        theta = math.acos(operator.truediv((c**2 + b**2 - a**2), (2*b*c)))
        ang = math.atan(operator.truediv(z, x)) + theta
        
        x1 = b * math.cos(ang)
        z1 = b * math.sin(ang)
        d = math.sqrt((x - x1)**2 + ((z - ed - z1)**2))
        
        j1 = math.atan(operator.truediv(z, x)) + theta
        j2 = math.acos(operator.truediv((a**2 + b**2 - c**2), (2*a*b)))
        j3 = math.acos(operator.truediv(((a**2) + (ed**2) - (d**2)), (2*a*ed)))

        tn = math.atan(operator.truediv(y, xt))

        self.servo.setServoPos(1, (90.0 - math.degrees(tn)), 1)
        self.servo.setServoPos(0, (190.0 - math.degrees(j2)), 1)
        self.servo.setServoPos(2, (240.0 - math.degrees(j3)), 1)
        if (126.0 - math.degrees(j1)) < 0:
            self.servo.setServoPos(3, 0, 1)        
        else:
            self.servo.setServoPos(3, (126.0 - math.degrees(j1)), 1)
        
    """
    Testovanie serva
    """
    def crazyServo(self):
        self.setHomePosition(rate)

        i = 10
        n = 3
        while i >= 1:
            stupen = i * 10
            servoPosition = stupen * 2
            
            if servoPosition <= 55:
                srv=0
                while srv <= n:
                    if srv == 1:
                        self.servo.setServoPos(srv, servoPosition+25, 8)
                    elif srv == 3:
                        self.servo.setServoPos(srv, servoPosition-20, 8)
                        self.setHomePosition(rate)
                    else:
                        if srv == 2:
                            timeOffset = 8
                        else:
                            timeOffset = 5
                        self.servo.setServoPos(srv, servoPosition, timeOffset)
                    
                    srv += 1
                
            i -= 1 

        self.setHomePosition(rate)        
