import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

class AddInvItemContainer extends React.Component{
  constructor(){
    super();
    this.state = {modalIsOpen: false};
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal(){
    this.setState({modalIsOpen: true});
  }

  closeModal(){
    this.setState({modalIsOpen: false});
  }

  render(){
    return(
      <div>
      <button onClick={this.openModal}>Open Modal</button>
      <Modal
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeModal}
      >
        <h2>Hello</h2>
        <button onClick={this.closeModal}>close</button>
        <AddInventoryForm/>
      </Modal>
    </div>
  );
  }
}

class AddInventoryForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {itemName: '', itemPic: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleItemPicChange = this.handleItemPicChange.bind(this);
  }

  handleInputChange(event){
    const name = event.target.name;
    const value = event.target.value;
    this.setState({[name]: value});
  }

  handleItemPicChange(event){
    const fileName = event.target.files[0].name;
    const file = event.target.files[0]

    this.setState({itemPicName: fileName, itemPic: file })
  }

  handleSubmit(event){
    event.preventDefault();
    let formData = FormData();
    formData.append("itemName", this.state.itemName);
    formData.append("itemPic", this.state.file, this.state.fileName);

    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=addItem";
    let fetchOptions = {
      method: 'POST',
      body: formData
    }
    fetch(url, fetchOptions).then((response) => console.log(response.json()));

  }

  render(){
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Item Name:
          <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange}/>
        </label>
        <label>
          Item Picture:
          <input type="file" name="itemPic" onChange={this.handleItemPicChange}/>
        </label>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

ReactDOM.render(
  <AddInvItemContainer/>,
  document.getElementById('root')
);
