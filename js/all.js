const productList = document.querySelector(".productWrap"); //購物清單列表
const cartList = document.querySelector(".shoppingCart-tableList");
let productData = [];
let cartData = [];
function init(){
    getProductList();
    getCartList()
};
init();
//從六角取出API。然後用forEach迴圈做出購物表單
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        //productData在外層設定陣列變數，第2行
        productData = response.data.products;
        renderProductList();
    })
    .catch(function(error){
        console.log(error);
    })
};
//將li結構拉出來包成函式，避免重複
function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`;
}
//取出ulli清單，包成一個函式，比較簡潔
function renderProductList(){
    let str = ``;
        productData.forEach(function(item,index){
            //productWrap裡面的ulli清單
            str += combineProductHTMLItem(item);
            productList.innerHTML = str;
        });
}
//選單選取
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change",function(e){
    //category是productData，符合選單中value的值
    const category = e.target.value;
    if (category == "全部"){
        renderProductList(); //跑全部
        return; //終止，不跑下一步
    }
    let str = "";
    productData.forEach(function(item,index){
        if (item.category == category){
            str += combineProductHTMLItem(item);
        }
    });
    productList.innerHTML = str;
});
//加入購物車
productList.addEventListener("click",function(e){
    e.preventDefault();//默認，防止按一次跑回最上面
    let addCartClass = e.target.getAttribute("class");
    if (addCartClass !== "addCardBtn"){
        return alert("點擊錯誤")
    };
    let productID = e.target.getAttribute("data-id");
    console.log(productID);
    let numCheck = 1;
    cartData.forEach(function(item,index){
        if (item.product.id === productID){
            numCheck = item.quantity+=1;
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productID,
            "quantity": numCheck
          }
    }).then(function(response){
        console.log(response);
        alert("加入購物車")
        getCartList();
    })
});
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        document.querySelector(".js-total").textContent = toThousands(response.data.finalTotal);
        cartData = response.data.carts;
        let str = "";
        cartData.forEach(function(item,index){
            str +=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price*item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id=${item.id}>
                    clear
                </a>
            </td>
        </tr>`
        });
        cartList.innerHTML = str;
    })
    .catch(function(error){
        console.log(error);
    })
};
cartList.addEventListener("click",function(e){
    e.preventDefault();
    const cartID = e.target.getAttribute("data-id");
    if (cartID == null){
        return alert("點擊錯誤")
    };
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartID}`)
    .then(function(response){
        alert("成功刪除單筆購物車");
        getCartList();
    })
})
//刪除全部品項
const discardBtn = document.querySelector(".discardAllBtn");
discardBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("刪除全部購物車成功");
        getCartList();
    })
    .catch(function(response){
        alert("已經清空購物車，請勿再次點擊")
    })
});
//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if (cartData.length == 0){
        alert("請加入購物車")
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;
    if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == ""){
        return alert("請輸入訂單資訊");
    };
    if (validateEmail(customerEmail)==false){
        alert("請填寫正確的Email");
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
          }
    }).then(function(response){
        alert("訂單建立成功");
        getCartList();
    })
});

const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
  if (validateEmail(customerEmail.value) == false) {
    document.querySelector(`[data-message=Email]`).textContent = "請填寫正確 Email 格式";
    return;
  }
});





//千分位小數點
function toThousands(x){
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

function validateEmail(mail) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
      return true
    }
    return false;
  }
  function validatePhone(phone) {
    if (/^[09]{2}\d{8}$/.test(phone)) {
      return true
    }
    return false;
  }
  