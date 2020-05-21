export function JSONParse(content: string): any {
  // Converting JSON object to JS object
  let obj = JSON.parse(content);

  for (var k in obj) {
    if (obj[k] instanceof Object) {
      JSONParse(obj[k]);
    } else {
      document.write(obj[k] + "<br>");
    }
  }
}
