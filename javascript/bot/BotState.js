const swim = require('swim-client-js');

class BotState {
    constructor(swimUrl) {
        this._fullSwimUrl = swimUrl;
        this._swimClient = new swim.Client();
        this._botState = {
            canDriveForward: null,
            canDriveBackward: null,
            isDrivingForward: null,
            isDrivingBackward: null
        }

        this._swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/botState')
            .lane('canDriveForward')
            .didSet((newValue) => {
                if(this._botState.canDriveForward !== newValue) {
                    this._botState.canDriveForward = newValue
                }
            })
            .open();    

        this._swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/botState')
            .lane('canDriveBackward')
            .didSet((newValue) => {
                if(this._botState.canDriveBackward !== newValue) {
                    this._botState.canDriveBackward = newValue
                }
            })
            .open();    

        this._swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/botState')
            .lane('isDrivingForward')
            .didSet((newValue) => {
                if(this._botState.isDrivingForward !== newValue) {
                    this._botState.isDrivingForward = newValue
                }
            })
            .open();              

        this._swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/botState')
            .lane('isDrivingBackward')
            .didSet((newValue) => {
                if(this._botState.isDrivingBackward !== newValue) {
                    this._botState.isDrivingBackward = newValue
                }
            })
            .open();              

    }
    
    getFullState() {
        return this._botState;
    }

    setStateValue(key, value) {
        // console.info('set state', key, value, this._fullSwimUrl);
        swim.command(this._fullSwimUrl, `/botState`, key, value);

    }

}

module.exports = BotState;