const fs = require('fs');
var readline = require('readline');
const path = require("path");
const directoryPath = path.join(__dirname, './static');
fs.readdir(directoryPath, function (err, files) {

    var jsFile = "";
    var jsFileName = "";
    var yamlFile = "";

    let array = [];
    if (err) {
        console.log(err);
    }
    if (files) {
        files.forEach(function (fileName) {
            var filePath = path.join(directoryPath, fileName);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                console.log(`file : ` + fileName);
                if (fileName.indexOf('.js') != -1) {
                    jsFile = filePath;
                    jsFileName = fileName;
                } else if (fileName.indexOf('.yaml') != -1) {
                    yamlFile = filePath;
                }
            }
        });
        console.log(`yaml : ` + yamlFile);
        console.log(`js   : ` + jsFile);
        handlerName(jsFile).then(handler => {
            console.log(handler);
            yamlModifier(yamlFile, jsFileName, handler).then(data => {
                console.log(data);
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        });
    }
});

var handlerName = function (handlerFile) {
    return new Promise((resolve, reject) => {
        if (null == handlerFile || handlerFile.trim() == "") {
            reject("file not found...");
        }
        var rd = readline.createInterface({
            input: fs.createReadStream(handlerFile),
            console: false
        });
        rd.on('line', function (line) {
            if (line.indexOf('exports.') != -1)
                resolve(line.split(" ")[0].split('.')[1]);
        });
    });
}

var yamlModifier = function (yamlFile, jsFileName, handlerName) {
    return new Promise(function (resolve, reject) {
        if (yamlFile == null || yamlFile == undefined) {
            reject("file not found");
        } else {

            fs.readFile(yamlFile, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                }
                data = data.replace(/{{index}}/g, jsFileName.replace('.js', ''));
                data = data.replace(/{{handler}}/g, handlerName);

                fs.writeFile("output.yaml", data, 'utf8', function (err) {
                    if (err) reject(err);
                    resolve("success");
                });
            });

        }
    });
}