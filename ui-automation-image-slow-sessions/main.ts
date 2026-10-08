import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// What the Image Recorder captured: Email and Phone with their labels, the notes, Save, the message's OK.
const IMG_EMAIL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAAAaCAIAAAClwCDnAAADqUlEQVRoBe3BsQpbOwJF0bO/ZwSjbvTRt7ilO6lUqUL/sx8IDDakSJgUL7HXYq+Zr8/GXjNfn429Zr4+G3vNfL277kc+CXvNfL277scYIx+DvWa+3l33Y4zRe89nYK+Zr3fX/Rhj9N7zGdhr5uvddT/GGL33fAb2mvkdSm17zfwVrvsxxui950cANX8R9ppJSm15sdfMTyu17TVLbXvN/BWu+zHG6L3nRwA1vwhQ8xMANT8NyAs1v4i9ZpJS214z/4dS214zf4Xrfowxeu/5EUDNLwLU/G6AmheAml/BXjNJqW2vmRelthx7zVJbkr1mjlJbjr1mklLbXrPUttdMUmrba+ZPdt2PMUbvPQeQQ00CqEmAHGoSIE9q3gE5VEDNAaiACqiACuRJzQHkSQXUJEAONQmgAjlUIImaA8ihJmGvmaTUlqe9ZpJS214zSaltr5mk1LbXzItS216z1LbXLLXtNZOU2vaa+ZNd92OM0XvPO0AF1LwAVEDNAah5Aag5ADUHoAJJ1CSACqg5ABVQcwAqoAJqEkBNAqiAmgRQkwBqXgAqe80kpba9Zl6U2vaaSUpte80kpba9ZpJSW572mqW2vWapba+Zv8J1P8YYvfccQJ5UQE0C5EkF1ByAmheAmgNQcwAqoOYAVEDNAaiAmgNQARVQkwBqEkAF1CSAmgRQkwB5UtlrJim17TXzotS210xSattrJim17TVLbXvNHKW2vWapba9Zattr5q9w3Y8xRu89CaDmAFRABdQcgAqoOQA1LwA1B6DmAFRAzQGogJoDUAE1B6ACKqAmAdQkgAqoSQA1CaACag5AZa+ZpNS218yLUtteM0mpba+ZpNS21yy17TVzlNr2mqW2vWapba+ZpNS218yf7LofY4zeexJAzQGogAqoOQAVUHMAahJATQKoOQA1B6ACag5ABdQcgAqoOQAVUJMAeaEmAdQkgJoEUAE1B6Cy10xSasuLvWapba+ZpNS210xSattrJim15WmvWWrba5ba9ppJSm17zfzJrvsxxui95wDypAJqEiBPKqDmANQkgJoDSKImAfKkAmoOQAXUHICaBMiTmgRQ8yOAmgRQkwBqEiBPKnvNfL277scYo/eefytAzQHkSc2vY6+Zr3fX/Rhj9N7zLwPkUPP7sNfM17vrfowxeu/5DOw18/Xuuh9jjN57PgN7zXy9u+7HGKP3ns/AXjNf7677McboveczsNfM17v//Pd/+STsNfP12dhr5uuz/QNDAAJrUmNFnAAAAABJRU5ErkJggg==";
const IMG_PHONE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAAAaCAIAAAClwCDnAAADlUlEQVRoBe3BsQrsOhJF0bO/ZwSjbPTRDhw6k8IKK6j/OQ8EDTZ9H0x6ca9FZejn3agM/bwblaGfd6My9PN0nJfehMrQz9NxXmstvQaVoZ+n47zWWnNOvQOVoZ+n47zWWnNOvQOVoZ+n47zWWnNOvQOVoT9pfVSGXuk4r7XWnFPvQGVIan3oozIktT4qQ690nNdaa86p/wNgWzeAbX0BbOsGkGRbH4Bt/QvAtjZAm219AJJs6wnQZls3gG0qQ1LrozK0tT4qo/VRGXql47zWWnNO3QC29QRIsq0PQJJtPQGSbOsDsK0bQJJt/QkgybYkwLY2wLYkwLa+ALa1Aba1AZJsUxmSWh+Voa31URmtD31UhrbWh7bKkNT60EdlaGt9aKsMba2PytDf4zivtdacUzeAbd0AtgHb2gDbgG19AWxrA2zrC2BbXwDbgG1JgG1tgG3Atv4EsK0NsC0JsA3YpjIktT4qQ1vrozJaH5WhrfVRGa2PytDW+qiM1kdlaGt9VEbrozK0tT4qQ1LrozL09zjOa60159QNYFsfgG1JgG1JgG1JgG19AWxrA/RhWx+AbT0BtiUBtiUBtrUBtgF92NYNYFsbYBuwLQmwTWVIan3oozIktT4qQ1vrozJaH5WhrfVRGa2PytDW+qiM1oduKkN/oeO81lpzTkmAvtgGdGMb0I1tPQG2tQG2tQG2tQG29QToxrYkQB+2AdvaANv6AGxrA2wDuqEyJLU+KkM3rY/K0Nb6qIzWR2Voa31URuujMrS1Piqj9VEZ+ssd57XWmnPqBrCtL4Bt3QC29QWwrQ2wrQ2wrQ2wrX8B2NYTYBuwrQ2wrQ/AtjbAtj4A21SGpNZHZeim9VEZ2lofldH6qAxtrY/KaH1UhrbWR2W0PipDW+ujMiS1PipDf4/jvNZac07dALb1BbCtG8C2vgC2tQG2tQG2tQG29S8A27oBbEsCbGsDbOsDsK0NsK0PwDaVIan1URm6aX1UhrbWR2VIan1oqwxJrY/K0Nb6qAxJrQ9tlaGt9VEZ+nsc57XWmnPqBrCtL4Bt3QC29QRos60N0GZbG6DNtv4EsK0NkGRbH4A223oCtNnWDWCbytDP03Fea605p96BytDP03Fea605p96BytDP03Fea605p96BytDP03Fea605p96BytDP03Fea605p96BytDP03Fea605p96BytDP03/++z+9CZWhn3ejMvTzbv8A+PyxX3OHMHYAAAAASUVORK5CYII=";
const IMG_NOTES = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAYCAIAAADieO37AAACUklEQVRYCeXBIY7sRgAA0arzBATm0gaGZt3Q0MD3qXy1ZGlWk2wCPpp9z/s6+Um8r5OfxPs6gW0/+Bm8rxPY9mPOyQ/gfZ3Ath9zzjEGn877OoFtP+acYww+nfd1Att+zDnHGHw67+sEtv2Yc44x+N/USq14qBX/RQUqfge14o1a8ZX3dQLbfsw5xxg8VB4Vb9RKrXioFd9SK34fteKNWqkVD+/rBLb9mHOOMVjUim+plVrxUCu+pVb8PmrFG7XiK+/rBLb9mHOOMQC14o3KUgFqpVY8VB4Vi8pSASpLBagsFaBWagWoLBVfqTwqQGWpALVSK7UCvK8T2PZjzjnGANSKf6dWaqVWPNSKRa3UikWt1IpFrVjUSgUqQK1Y1IqHWrGolVqxqJVaqZVaAd7XCWz7MeccYwBqxRuVR6VWasVDrVjUSuVFpVYsasWiVmrFovKi4qFWLGql8qJSK7UC1Mr7OoFtP+acYwxArfhKrVjUSq3UiodasaiVWvFCrVjUikWt1IpFrfgnasWiVmrFC7VSK0CtvK8T2PZjzjnGYFErXqgVi1qplVrxUCsWtVIrFrVSKxa1YlErtWJRKxa14qFWLGqlVixqpVZqxeIv93UC237MOccYPFQeFaDyqNRKrXioPCoWlaUC1IqHylIBasVDZan4SuVRASpLBaiVWrH4y32dwLYfc84xBp/O+zqBbT/mnGMMPp33dQLbfsw5xxh8Ou/rBLb9mHOOMfh03tcJbPsx5xxj8Om8rxPY9mPOOcbg03lfJ/DHn3/xM3hfJz/J3zYMPYgZWksCAAAAAElFTkSuQmCC";
const IMG_SAVE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAeCAIAAAAq6D5VAAADmklEQVRoBe3BsWrrSBQG4H/ewbXTGjSgqaRpUlzQA/hBLmYhKrZNp0IBYfQYKqZUoeJAmiNVR3AEbuPaD7EwEEi4DveClt2A/X1GhXF3jVFh3F1jVBh31xgVRpSkOe6iHz9+tE1lVBhRkubLPOLmdaEnorapjAojStJ8mUfcvC70RNQ2lVFhREmaL/OIm9eFnojapjIqjChJ82UecfO60BNR21RGhRElab7MI25eF3oiapvKqDCiJM2XecRqWVHiz0xDje+nCz0RtU1lVBhRkubLPGK1rCg3uz2At9cnXPPw+ALgcgrTUOP76UJPRG1TGRVGlKT5Mo9YLSvKzW4P4O31Cdc8PL4AuJzCNNT4frrQE1HbVEaFESVpvswjVsuKcrPbA3h7fcI1D48vAC6nMA01fmGdxzsVxn+uCz0RtU1lVBhRkubLPGK1rCg3uz2At9cnXPPw+ALgcgrTUOMz67wK43/VhZ6I2qYyKowoSfNlHrFaVpSb3R7A2+sTrnl4fAFwOYVpqPGZdV6F8Zl1HpEKA7DOqzAi67wKA7DOI1JhrNOFnojapjIqjChJ82UesVpWlJvdHr9zOYVpqPEL6zwiFcZn1nkVts6rMCLrvApb51UYkXVehbFCF3oiapvKqDCiJM2XecRqWVFudnv8zuUUpqHG16zzKgzAOo93KgzAOq/C1nkVBmCdxwcqjBW60BNR21RGhRElab7MI1bLinKz2wOoD1tcUx7PAC6nMA01vmadV2HrvAojss6rMADrvApb51UYgHVehfEv6UJPRG1TGRVGlKT5Mo9YLSvKzW4PoD5s8UF5PAOoD9vyeAZwOYVpqPE167wKW+dVGJF1XoURWedVGJF1XoURWedVGCt0oSeitqmMCiNK0nyZR6yWFeVmtwdQH7b4oDyeAdSHbXk8A7icwjTU+Mw6j3cqjMg6j3cqjMg6r8J4Z51HpMJYpws9EbVNZVQYUZLmyzxitawoN7s9gPqwxQfl8QygPmzL4xnA5RSmocb304WeiNqmMiqMKEnzZR6xWlaUm90eQH3Y4pryeAZwOYVpqPH9dKEnorapjAojStJ8mUeslhUl/sw01Ph+utATUdtURoURJWm+zCNuXhd6ImqbyqgwoiTNl3nEzetCT0RtUxkVRpSk+TKPuHld6ImobSqjwoiSNF/mETevCz0RtU1lVBhRkubPz8+4A4iobSqjwoh+/vU37t61TWVUGHfX/ANXYP7WO97hhQAAAABJRU5ErkJggg==";
const IMG_OK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAcCAIAAAB56a/tAAADOklEQVRYCeXBIbKkWhAE0GQ/JUqWnf0gkNhxSATLaIFsd69MXBKR7OdHXDUL6Cd+v3Mmi/hNJov4TSaL+E0mixjmZcVXO/YNwGQRw7ysrTV8oz9//gA49g3AZBHDvKyttee+8F1e57v3DuDYNwCTRQzzsrbWnvvCd3md7947gGPfAEwWMczL2lp77gvf5XW+e+8Ajn0DMFnEMC9ra+25LwyRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZRHA63z33gEc+wZgsohhXtbW2nNf+C6v8917B3DsG4DJIoZ5WVtrz31hiCyL+KjIwmARQ2RZxBBZFvEhkWURwOt8994BHPsGYLKIYV7W1tpzX/gZkWURQ2RZBBBZFgFElkX8gNf57r0DOPYNwGQRw7ysrbXnvjBElkV8SGRZxD8iy2JkWYwsi/ioyLII4HW+e+8Ajn0DMFnEMC9ra+25L/yAyLKIf0SWxcgCYBE/5nW+e+8Ajn0DMFnEMC9ra+25LwyRZREfElkW8Y/IshhZACzi0yLLIoDX+e69Azj2DcBkEcO8rK21577wAyLLIv4RWRYjy2JkWcTPeJ3v3juAY98ATBYxzMvaWnvuC0NkWcTnRJZFDJFlEUBkWQQQWRbxOZFlEcDrfPfeARz7BmCyiGFe1tbac1/4MZGFwSKGyLKIIbIs4tNe57v3DuDYNwCTRQzzsrbWnvvCEFkW8b8VWRYBvM537x3AsW8AJosY5mVtrT33he/yOt+9dwDHvgGYLGKYl7W19twXhsiyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyGFkWI8tiZFmMLIuRZTGyLEaWxciyCOB1vnvvAI59AzBZxDAva2vtuS98l9f57r0DOPYNwGQRw7ysrbXnvvBdXue79w7g2DcAk0UM87K21v7+/Yuv03sHcOwbgMkihnlZ8dWOfQMwWcQwLyu+2rFvACaL+E0mi/hN/gOaXWwLFKLDrgAAAABJRU5ErkJggg==";

flow.create('main', "Slow sessions", (f) => {
  f.addDependency('Robomotion.ImageAutomation', '0.12.5');
  f.node('c90001', 'Core.Trigger.Inject', 'Start', {})
    .then('c90002', 'Core.Flow.SubFlow', 'Open Acme ERP over a slow session', {})
    .then('c90003', 'Robomotion.ImageAutomation.Image.ClickType', "Type the email", {
      image: IMG_EMAIL,
      deltaX: 116,
      deltaY: 13,
      inText: Custom("alan.turing@bletchley.example"),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optVerify: true,
      optWindow: "Remote Desktop Connection"
    })
    .then('c90004', 'Robomotion.ImageAutomation.Image.ClickType', "Type the phone", {
      image: IMG_PHONE,
      deltaX: 116,
      deltaY: 13,
      inText: Custom("+44 161 496 0815"),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optVerify: true,
      optWindow: "Remote Desktop Connection"
    })
    .then('c90005', 'Robomotion.ImageAutomation.Image.ClickType', "Type the notes", {
      image: IMG_NOTES,
      deltaX: 26,
      deltaY: 12,
      inText: Custom("Deliver to the side door before noon."),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optVerify: true,
      optWindow: "Remote Desktop Connection"
    })
    .then('c90006', 'Robomotion.ImageAutomation.Image.ClickImage', "Save", {
      image: IMG_SAVE,
      deltaX: 47,
      deltaY: 15,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c90007', 'Robomotion.ImageAutomation.OCR.WaitText', "Wait for the saved message", {
      inSearchText: Custom("Customer 10001 was"),
      optTimeout: Custom("40"),
      optMatch: "contains",
      optWindow: "Remote Desktop Connection"
    })
    .then('c90008', 'Robomotion.ImageAutomation.Image.ClickImage', "Close the message", {
      image: IMG_OK,
      deltaX: 40,
      deltaY: 14,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c90009', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
