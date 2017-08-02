################################################################################
# PSC.py
#
#   Interface for Parallax PSC Servo Control utilizing pySerial. For Windows
#   systems, pywin32 is required.
#
#     pySerial:   http://pyserial.sourceforge.net/
#     pywin32:    http://sourceforge.net/projects/pywin32/
#     PSC Serial: http://www.parallax.com/detail.asp?product_id=28023
#     PSC USB:    http://www.parallax.com/detail.asp?product_id=28823
#
#   Linux users will need the "usbserial" and "ftdi_sio" drivers either compiled
#   into the kernel or modprobed. The Parallax PSC will attach itself to the
#   /dev/ttyUSB0 node. If it does not exist, it will need to be manually created
#   by using the following command:
#   mknod /dev/ttyUSB0 c 188 0
#
#   Copyright (c) 2006, by Lucas Cowgar. All Rights Reserved.
#   lukedaman2000@yahoo.com
################################################################################

import serial

class ParallaxServoController(serial.Serial):
    ############################################################################
    # __init__: Initialize the serial class, customized for our needs. Set your
    #           default connection information here. All of the connection
    #           settings can be overridden when the class is called, but
    #           generally all that will need changed is the port and the
    #           baudrate ONLY if you wish to lock it at 2400.
    #
    # Vars:
    #   port:     Comm Port as a string
    #   baudrate: Desired baud rate. For the PSC this is either 2400 or 38400
    #   bytesize: Bytes as an integer. (Leave as 8 for PSC)
    #   parity:   Parity as a string. (Leave as 'N' for PSC, no parity.)
    #   stopbits: Stop bits as an integer (Leave as 1 for PSC)
    #   timeout:  Number of seconds the terminal will wait for a response after
    #             sending a command. If you use serial.read() to read a specific
    #             number of bytes instead of using serial.readline() to get the
    #             entire line returned, this timeout will never occur. You are
    #             encouraged to always read the specicific number of bytes that
    #             are expected to be returned and flush the input and output,
    #             regardless reading any returned data.
    #
    # Examples:
    #   s = PSC('COM1', baudrate=2400)
    #   s = PSC('/dev/ttyUSB0')
    #
    def __init__(self, port='COM5', baudrate=38400, bytesize=8, parity='N', stopbits=1, timeout=1):
        # Open at 2400 first, later we will change to 38400. If we are already
        # at 38400, this will simply fail w/o error. Later it will be opened
        # properly at 38400, if 38400 is set in the configuration.
        serial.Serial.__init__(self, port=port, baudrate=2400, bytesize=bytesize, parity=parity, stopbits=stopbits, timeout=timeout)

        # Set baud rate to 38400, if requested
        if baudrate == 38400:
            # Send command to set PSC to 38400, we like speed.
            self.sendCommand('SBR1', 3)
            self.close()

            # Re open at desired baud rate, 38400
            self.baudrate = baudrate
            self.open()

        # Fail if we are not open
        if self.isOpen() == False:
            raise Exception('Could not reopen at ' + baudrate + '.')

    ############################################################################
    # sendCommand: Handles sending raw commands to the device.
    #
    # Vars:
    #   cmd:         This is the command to be sent to the device less the
    #                preamble and the line terminator.
    #   readRespose: Set this to the number of bytes the given command is
    #                expected to return. If set to 0, anything returned
    #                will be flushed.
    #
    # Examples:
    #   s.sendCommand('VER?', 3) # Gets the hardware version number and
    #                            # reads the 3 bytes expected to be
    #                            # returned
    #
    def sendCommand(self, cmd, readResponse = 0):
        self.write('!SC' + cmd + '\r')
        if readResponse == 0:
            return

        result = self.read(len(cmd) + 4 + readResponse)
        return result[len(cmd)+4:]

    ############################################################################
    # getVersionNumber: Returns hardware version number
    #
    # Vars:
    #   None
    #
    # Examples:
    #  s.getVersionNumber() # Returns stripped version number
    #
    def getVersionNumber(self):
        return self.sendCommand('VER?', 3)


    ############################################################################
    # setServoPos: Sets the servo position and ramp rate
    #
    # Vars:
    #   num:  Servo number as an integer
    #   pos:  Position as float in degrees to set the servo to (0-180)
    #   ramp: Ramp as integer (0-61)
    #
    # Examples:
    #   s.setServoPos(9, 45)      # Sets servo 9 to 45* as fast as possible
    #   s.setServoPos(0, 180, 61) # Sets servo 0 to 180* very slowly
    #
    def setServoPos(self, num, pos = 8, ramp = 0):
        if pos > 180 or pos < 0:
            raise Exception('Servo position (%.1f) out of range. Input must be between 0 and 180.' % (float(pos)))

        if ramp > 61 or ramp < 0:
            raise Exception('Ramp out of range. Must be between 0 and 61, %i sent.' % (int(ramp)))

        realPos = int(pos * (1000.0/180.0) + 250.0)
        self.sendCommand(chr(num) + chr(ramp) + chr(realPos%256) + chr(realPos/256), 3)


    ############################################################################
    # getServoPos: Returns the current servo position as a float in degrees
    #
    # Vars:
    #   num: Servo number as an integer
    #
    # Examples:
    #   s.setServoPos(0, 45)
    #   s.getServoPos(0) # returns 45.0
    #
    def getServoPos(self, num):
        result = self.sendCommand('RSP' + chr(num), 3)
        pos = float(ord(result[2]) + (ord(result[1]) * 256))
        return (pos - 250.0) / (1000.0/180.0)

        
        