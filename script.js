const mentionData=[
{model:'ChatGPT',rate:18},
{model:'Gemini',rate:42},
{model:'Claude',rate:31},
{model:'Perplexity',rate:27}
]

const brandData=[
{name:'برند شما',value:2,fill:'#3b82f6'},
{name:'رقیب الف',value:65,fill:'#8b5cf6'},
{name:'رقیب ب',value:28,fill:'#6366f1'}
]

function showToast(message){
const toast=document.getElementById('toast')
toast.textContent=message
toast.classList.add('show')
setTimeout(()=>{
toast.classList.remove('show')
},3000)
}

function toggleMobileMenu(){
const menu=document.getElementById('mobileMenu')
menu.classList.toggle('open')
}

function handleDomainSubmit(){
const input=document.getElementById('domainInput')
const domain=input.value.trim()

if(!domain){
showToast('دامنه را وارد کنید')
return
}

showToast('در حال تحلیل '+domain)
}

function setupNavbar(){
const navbar=document.getElementById('navbar')

window.addEventListener('scroll',()=>{
if(window.scrollY>20){
navbar.classList.add('nav-scrolled')
}else{
navbar.classList.remove('nav-scrolled')
}
})
}

document.addEventListener('DOMContentLoaded',()=>{
setupNavbar()
})
