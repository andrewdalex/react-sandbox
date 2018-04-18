import ReactDOM from 'react-dom';
import React from 'react';
import {InvItemFormContainer} from "./addInventory.jsx";

function renderEditInvModal(){
  let itemContainer = ReactDOM.render(
    <InvItemFormContainer modalIsOpen={true} isEdit={true} />,
    document.getElementById('editItemRoot')
  );
  itemContainer.openModal();
}


window.onload = function(){
  const buttons = document.querySelectorAll("button.editInvButton");
  console.log(buttons);
  for (let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", renderEditInvModal);
  }
}
