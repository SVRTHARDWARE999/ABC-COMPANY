// bottom nav-bar script
const bottombar = document.querySelector('footer')
fetch('app-bars/bottom-bar.html')
.then(res=>res.text())
.then(data=>{
    bottombar.innerHTML=data
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'text/html')
    eval(doc.querySelector('script').textContent)
})