"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result && (result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            if (!op || !Array.isArray(op) || op[0] === undefined) {
                return;
            }            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var utils_1 = require("./utils");
var args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node download.js <prefix> [<folder>] [<skipFailed>] [<batchSize>] [<limit>] [<token>]');
    console.log('       <prefix>: the prefix of the files to download');
    console.log('                 to process the root bucket use prefix ""');
    console.log('       <folder>: (optional), name of subfolder for downloaded files, default is "downloads"');
    console.log('       <skipFailed>: "true" to skip retrying failed uploads, "false" or any other value to retry');
    console.log('       <batchSize>: (optional), default is 100');
    console.log('       <limit>: (optional), stop after processing this many files');
    console.log('       <token>: (optional), begin processing at this pageToken');
    process.exit(1);
}
var prefix = args[0];
var batchSize;
var limit = 0;
var count = 0;
var downloaded = 0;
var token = '';
var folder = 'downloads';
var skipFailed = 'true';
/*

{
  prefix: '',
  autoPaginate: false,
  maxResults: 100,
  pageToken: 'xxxxxxxxxxxxxxxxxxxx'
}

*/
// GetFilesOptions: 
// https://googleapis.dev/nodejs/storage/latest/global.html#GetFilesOptions
//
try {
    if (args[1]) {
        folder = args[1];
    }
    // check if folder is a valid folder name
    if (!folder.match(/^[a-zA-Z0-9_\-]+$/)) {
        console.log('folder name must be alphanumeric');
        process.exit(1);
    }
    if (!(0, fs_1.existsSync)("./".concat(folder))) {
        (0, fs_1.mkdirSync)("./".concat(folder));
    }
}
catch (err) {
    console.error('error creating ./downloads folder:');
    console.error(err);
    process.exit(1);
}
try {
    skipFailed = args[2] || 'true' == 'true';
}
catch (err) {
    console.error('error setting skipFailed:');
    console.error(err);
    process.exit(1);
}
try {
    batchSize = parseInt(args[3] || '100');
}
catch (err) {
    console.error('error setting batchSize:');
    console.error(err);
    process.exit(1);
}
try {
    limit = parseInt(args[4] || '0');
}
catch (err) {
    console.error('error setting limit:');
    console.error(err);
    process.exit(1);
}
try {
    if (args[5]) {
        token = args[5];
        if (token.length !== 64) {
            console.error('token must be 20 characters long');
            process.exit(1);
        }
    }
}
catch (err) {
    console.error('error in token:');
    console.error(err);
    process.exit(1);
}
var storage = (0, utils_1.getStorageInstance)();
function processBatch(fileSet, queryForNextPage) {
    return __awaiter(this, void 0, void 0, function () {
        var file, err, err_1, file_name;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(fileSet.length > 0)) return [3 /*break*/, 5];
                    file = fileSet.shift();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    file_name = file.name.replace('meetings/', '')
                    if (fs_1.existsSync('downloaded_files.log')) {
                        const logData = fs_1.readFileSync('downloaded_files.log', 'utf8');
                        if (logData.includes(file_name)){
                            console.log('Files already downloaded: ', file_name);
                            processBatch(fileSet, queryForNextPage);  // Continue with the next file
                            return; 
                        }
                    }
                    console.log('downloading: ', file_name);
                    return [4 /*yield*/, storage.bucket((0, utils_1.getBucketName)())
                            .file(file.name)
                            .download({ destination: "./".concat(folder, "/").concat(encodeURIComponent(file_name))
                            }).then( () => {
                                fs_1.appendFileSync('downloaded_files.log', `${file_name}\n`, 'utf8')
                            })];
                case 2:
                    try{
                    err = (_a.sent())?.[0];
                    } catch (e) {
                        if (skipFailed === true){
                            processBatch(fileSet, queryForNextPage);
                        } else {
                            throw e;
                        }
                    }
                    if (err) {
                        fs_1.appendFileSync('failed_downloaded_files.log', `${file_name}\n`, 'utf8');
                        console.error('Error downloading file', err);
                    }
                    else {
                        downloaded++;
                    }
                    processBatch(fileSet, queryForNextPage);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    file_name = file.name.replace('meetings/', '')
                    fs_1.appendFileSync('failed_downloaded_files.log', `${file_name}\n`, 'utf8');
                    console.log('err', err_1);
                    if (skipFailed === true) {
                        processBatch(fileSet, queryForNextPage);
                    } else {
                        throw e;
                    }
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    if (queryForNextPage && (limit === 0 || count < limit)) {
                        getBatch(queryForNextPage);
                    }
                    else {
                        console.log("done: downloaded ".concat(downloaded, " files"));
                        process.exit(0);
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getBatch(query) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var fileSet, _b, files, queryForNextPage, c;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fileSet = [];
                    return [4 /*yield*/, storage.bucket((0, utils_1.getBucketName)())
                            .getFiles(query)];
                case 1:
                    _b = _c.sent(), files = _b[0], queryForNextPage = _b[1];
                    c = 0;
                    console.log('processing page: ', ((_a = queryForNextPage) === null || _a === void 0 ? void 0 : _a.pageToken) || '<starting page>');
                    files.forEach(function (file) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!file.name.endsWith('/')) { // skip folders
                                    count++;
                                    c++;
                                    if (limit === 0 || count <= limit) {
                                        fileSet.push(file);
                                    }
                                }
                                return [2 /*return*/];
                            });
                        });
                    });
                    // console.log('prepared batch of ', fileSet.length, ' files')
                    processBatch(fileSet, queryForNextPage);
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var startQuery;
        return __generator(this, function (_a) {
            startQuery = {
                prefix: prefix,
                autoPaginate: false,
                maxResults: batchSize,
                pageToken: token
            };
            getBatch(startQuery);
            return [2 /*return*/];
        });
    });
}
main();
