import WSModel from "../../algo-trading/models/wsModel";

// Note any database models can't be used as this tries to initilize models before DB initialization
const model = {
    wsModel: new WSModel(),
};


export default model;