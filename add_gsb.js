const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the insert point in the dropdown
let oldOption = '<option value="ธนาคารยูโอบี">ธนาคารยูโอบี</option>';
let newOption = '<option value="ธนาคารออมสิน">ธนาคารออมสิน</option>\n                    <option value="ธนาคารยูโอบี">ธนาคารยูโอบี</option>';

if (html.includes(oldOption)) {
    html = html.replace(oldOption, newOption);
} else {
    console.log("Could not find the option for UOB to insert before.");
}

// Find the dashboard color logic and add pink for GSB (ออมสิน)
let oldLogic = "else if(bank.includes('กรุงศรี')) { borderColor = 'border-warning'; }";
let newLogic = "else if(bank.includes('กรุงศรี')) { borderColor = 'border-warning'; }\n                  else if(bank.includes('ออมสิน')) { borderColor = 'border-danger'; }";

if (html.includes(oldLogic)) {
    html = html.replace(oldLogic, newLogic);
} else {
    console.log("Could not find the border color logic.");
}

fs.writeFileSync('index.html', html);
console.log('Added GSB (ออมสิน)!');
