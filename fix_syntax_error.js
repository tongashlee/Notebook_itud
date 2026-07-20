const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The syntax error is due to an extra `});` right before the closing `}` of renderSavings.
let badSyntax = `      }
    });
    }

    async function submitSaving(e) {`;

let goodSyntax = `      }
    }

    async function submitSaving(e) {`;

if (html.includes(badSyntax)) {
    html = html.replace(badSyntax, goodSyntax);
    fs.writeFileSync('index.html', html);
    console.log("Fixed syntax error successfully!");
} else {
    // try a more generic replace
    let badSyntax2 = `    });
    }

    async function submitSaving`;
    
    let goodSyntax2 = `    }

    async function submitSaving`;
    
    if (html.includes(badSyntax2)) {
        html = html.replace(badSyntax2, goodSyntax2);
        fs.writeFileSync('index.html', html);
        console.log("Fixed syntax error successfully (fallback pattern)!");
    } else {
        console.log("Could not find the syntax error pattern.");
    }
}
