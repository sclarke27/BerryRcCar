
class BotState {
    constructor(db) {
        this._db = db;

        this._stateData = {
            main: {
                currentIntent: null,
                startupTime: null,
                listenToRc: true,
            },

            movement: {
                canDriveForward: false,
                canDriveBackward: false,
                isDriving: false,
            },

            obsticles: {
                left: false,
                right: false,
                center: false,

            }
        }
    }


    getFullState() {
        return this._stateData;
    }

    getStateValue(dataSet, key) {
        const _dataSet = this._stateData[dataSet];
        return _dataSet[key];
    }

    setStateValue(dataSet, key, value) {
        const _dataSet = this._stateData[dataSet];
        _dataSet[key] = value;
        this._db.botState.findAndModify({
            query: { name: key },
            update: { $set: { value: value } },
            new: true,
            upsert: true
        }, (err, doc, lastErrorObject) => {
        })
    }

    saveDataSetToDB() {
        for(const key of Object.keys(this._stateData)) {
            const value = this._stateData[key];
            this._db.botState.findAndModify({
                query: { name: key },
                update: { $set: { value: value } },
                new: true,
                upsert: true
            }, (err, doc, lastErrorObject) => {
            })
        }
    }
}

module.exports = BotState;
