const baseUrl = "https://livejs-api.hexschool.io";
const api_path = "connie";

let productData;
let cartData;
let isClick = true;

const productSelect = document.querySelector(".productSelect");
const productWrap = document.querySelector(".productWrap");
const cart = document.querySelector(".shoppingCart-table tbody");
const form = document.querySelector("form");
const inputs = document.querySelectorAll(
  "input[type=email], input[type=tel], input[type=text]"
);

const constraints = {
  姓名: {
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 2,
      message: "需超過 2 個字"
    }
  },
  電話: {
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 9,
      maximum: 15,
      message: "字數需符合 9 - 15 的區間"
    }
  },
  Email: {
    presence: {
      message: "是必填欄位"
    },
    email: {
      message: "需符合 email 格式"
    }
  },
  寄送地址: {
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 10,
      message: "不可少於 10 個字"
    }
  }
};

function getProductCard() {
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/products`;

  axios
    .get(url)
    .then((res) => {
      productData = res.data.products;
      renderProductCard(productData);
    })
    .catch((error) => alert(`${error.response.data.message}`));
}

function renderProductCard(data) {
  productWrap.innerHTML = "";

  data.forEach((item) => {
    productWrap.innerHTML += `
      <li class="productCard">
         <h4 class="productType">新品</h4>
         <img src="${item.images}" alt="">
         <a class="addCardBtn cursor-pointer" data-id=${item.id}>加入購物車</a>
         <h3>${item.title}</h3>
         <del class="originPrice">NT$${item.origin_price.toLocaleString()}</del>
         <p class="nowPrice">NT$${item.price.toLocaleString()}</p>
      </li>
    `;
  });

  const addCartBtn = document.querySelectorAll(".addCardBtn");

  addCartBtn.forEach((item) =>
    item.addEventListener("click", (e) => {
      if (isClick) addToCart(e.target.dataset.id);
    })
  );
}

function getCartProduct() {
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;

  axios
    .get(url)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;
      renderCart(cartData, total);
    })
    .catch((error) => alert(`${error.response.data.message}`));
}
function renderCart(data, total) {
  cart.innerHTML = "";

  if (data.length === 0) {
    cart.innerText = "購物車目前尚無商品";
    return;
  }

  cart.innerHTML += `
    <tr>
      <th width="40%">品項</th>
      <th width="15%">單價</th>
      <th width="15%">數量</th>
      <th width="15%">金額</th>
      <th width="15%"></th>
    </tr>
  `;

  data.forEach((item) => {
    cart.innerHTML += `
      <tr>
         <td>
           <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
           </div>
         </td>
         <td>NT$${item.product.price.toLocaleString()}</td>
         <td>
           <i class="fa-regular fa-square-minus minus cursor-pointer" data-id="${
             item.id
           }"></i>
           ${item.quantity} 
           <i class="fa-regular fa-square-plus plus cursor-pointer" data-id="${
             item.id
           }"></i>
         </td>
         <td>NT$${(item.product.price * item.quantity).toLocaleString()}</td>
         <td class="discardBtn">
           <a class="material-icons deleteBtn cursor-pointer" data-id="${
             item.id
           }">
             clear
           </a>
         </td>
      </tr>
    `;
  });

  cart.innerHTML += `
    <tr>
      <td>
         <a class="discardAllBtn cursor-pointer">刪除所有品項</a>
       </td>
       <td></td>
       <td></td>
       <td>
         <p>總金額</p>
       </td>
       <td>NT$${total.toLocaleString()}</td>
    </tr>
  `;

  const deleteBtn = document.querySelectorAll(".deleteBtn");
  const discardAllBtn = document.querySelector(".discardAllBtn");
  const plus = document.querySelectorAll(".plus");
  const minus = document.querySelectorAll(".minus");

  deleteBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (isClick) deleteCartProduct(e.target.dataset.id);
    });
  });

  discardAllBtn.addEventListener("click", () => {
    if (isClick) cleanCart();
  });

  plus.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (isClick) cartProductPlus(e.target.dataset.id);
    });
  });

  minus.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (isClick) cartProductMinus(e.target.dataset.id);
    });
  });
}

function addToCart(id) {
  isClick = false;
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  let count = 1;

  cartData.forEach((item) => {
    if (item.product.id === id) {
      count = item.quantity + 1;
    }
  });

  const data = {
    data: {
      productId: id,
      quantity: count
    }
  };

  axios
    .post(url, data)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;

      renderCart(cartData, total);
      alert("已成功加入購物車");
      isClick = true;
    })
    .catch((error) => {
      alert(`${error.response.data.message}`);
      isClick = true;
    });
}

function deleteCartProduct(id) {
  isClick = false;
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${id}`;

  axios
    .delete(url)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;

      renderCart(cartData, total);
      alert("已從購物車移除此商品");
      isClick = true;
    })
    .catch((error) => {
      alert(`${error.response.data.message}`);
      isClick = true;
    });
}

function cleanCart() {
  isClick = false;
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;

  axios
    .delete(url)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;

      renderCart(cartData, total);
      alert("已清空購物車");
      isClick = true;
    })
    .catch((error) => {
      alert(`${error.response.data.message}`);
      isClick = true;
    });
}

function cartProductPlus(id) {
  isClick = false;
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  let count;

  cartData.forEach((item) => {
    if (item.id === id) {
      count = item.quantity + 1;
    }
  });

  const data = {
    data: {
      id: id,
      quantity: count
    }
  };

  axios
    .patch(url, data)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;

      renderCart(cartData, total);
      isClick = true;
    })
    .catch((error) => {
      alert(`${error.response.data.message}`);
      isClick = true;
    });
}

function cartProductMinus(id) {
  isClick = false;
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  let count;

  cartData.forEach((item) => {
    if (item.id === id) {
      count = item.quantity - 1;
    }
  });

  if (count < 1) {
    alert("數量不可小於 1");
    isClick = true;
    return;
  }

  const data = {
    data: {
      id: id,
      quantity: count
    }
  };

  axios
    .patch(url, data)
    .then((res) => {
      const total = res.data.finalTotal;
      cartData = res.data.carts;

      renderCart(cartData, total);
      isClick = true;
    })
    .catch((error) => {
      alert(`${error.response.data.message}`);
      isClick = true;
    });
}

productSelect.addEventListener("change", (e) => {
  if (e.target.value === "全部") {
    renderProductCard(productData);
  } else {
    const newData = productData.filter(
      (item) => item.category === e.target.value
    );
    renderProductCard(newData);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (isClick) {
    isClick = false;

    inputs.forEach((item) => (item.nextElementSibling.textContent = ""));

    const errors = validate(form, constraints);

    if (errors) {
      Object.keys(errors).forEach((key) => {
        document.querySelector(`[data-message=${key}]`).textContent =
          errors[key];
      });

      isClick = true;
      return;
    }

    if (cartData.length === 0) {
      alert("購物車內尚無商品，無法送出訂單");
      isClick = true;
      return;
    }

    const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/orders`;
    const data = {
      data: {
        user: {
          name: document.querySelector("#customerName").value,
          tel: document.querySelector("#customerPhone").value,
          email: document.querySelector("#customerEmail").value,
          address: document.querySelector("#customerAddress").value,
          payment: document.querySelector("#tradeWay").value
        }
      }
    };

    axios
      .post(url, data)
      .then((res) => {
        getCartProduct();
        form.reset();

        alert("已送出訂單");
        isClick = true;
      })
      .catch((error) => {
        alert(`${error.response.data.message}`);
        isClick = true;
      });
  }
});

getProductCard();
getCartProduct();
