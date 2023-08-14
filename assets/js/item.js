let count=0;
getProducts(count)

const LoadMore = document.getElementById("LoadMore")
LoadMore.addEventListener("click",function(){
    count = count+5
    getProducts(count)
})


function getProducts(num){
    fetch("/get-products?count=" + num)
    .then(function(response){
        if (response.status !== 200){
            throw new Error("Something went wrong in getProduct function")
        }
        return response.json()
    })
    .then(function(products){
        
        products.forEach(function(item){
            AddToDOM(item)            
        })
        if(products.length < 5){
            LoadMore.style.display = "none"
        }
    })
    .catch(function(error){
        alert(error)
    })
}
function AddToDOM(item){
    const card = document.getElementById("card")
    const div1 = document.createElement("div")
    div1.className = "card-header"
    const img = document.createElement("img")
    img.src = item.productImage
    const div2 = document.createElement("div")
    div2.className = "card-body"
    const h4 = document.createElement("h4")
    h4.className = "product-title"
    h4.innerHTML= item.productName
    const h3 = document.createElement("h3")
    h3.className = "product-prices"
    h3.innerHTML = "₹"+item.productPrice
    const div3 = document.createElement("div")
    div3.className = "card-footer"
    const btn1 = document.createElement("button")
    btn1.className = "btn btn-secondary"
    btn1.innerHTML= "Add Cart"
    const btn2 = document.createElement("button")
    btn2.className = "btn btn-primary"
    btn2.innerHTML= "View details"
    btn2.id="ViewDetails"
    const div4 = document.createElement("div")
    div4.className = "product-card"
    div1.append(img)
    div2.append(h4)
    div2.append(h3)
    div3.append(btn1)
    div3.append(btn2)
    div4.appendChild(div1)
    div4.appendChild(div2)
    div4.appendChild(div3)
    card.appendChild(div4)
    // btn2.addEventListener("click",function(){
    //     document.location.href='/details?name='+ JSON.stringify(item);
    // })
}


