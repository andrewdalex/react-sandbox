import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';


class AddInvItemContainer extends React.Component{
  constructor(props){
    super(props);
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
      <button onClick={this.openModal}>Add Item to Inventory</button>
      <Modal
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeModal}
      >
        <h2>Add Inventory</h2>
        <AddInventoryForm closeModal={this.closeModal}/>
      </Modal>
    </div>
  );
  }
}


function TextInput(props){
  let feedback = null;
  let validInputClass = "";
  if (props.valid && props.valid === "valid"){
    feedback = <div className="valid-feedback">
                {props.feedback}
              </div>
    validInputClass = "is-valid";
  }
  else if (props.valid && props.valid === "invalid"){
    feedback = <div className="invalid-feedback">
                {props.feedback}
              </div>
    validInputClass = "is-invalid";
  }

  return(
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <input id={props.name} className={`form-control ${validInputClass}`} type="text"
        name={props.name} value={props.value} onChange={props.onChange}
      />
      {feedback}
    </div>
  );
}

class AddInventoryForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {itemName: '',
                  largeItemPic: '',
                  smallItemPic: '',
                  largeItemPicName:'',
                  smallItemPicName:'',
                  totalCost: '',
                  rentalPrice: '',
                  itemTypes: [],
                  itemType: '',
                  helpURL: '',
                  alert: false,
                  alertMessage: "",
                  alertType: ""
                };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleItemPicChange = this.handleItemPicChange.bind(this);
    this.getItemTypes = this.getItemTypes.bind(this);
    this.setDefaultItem = this.setDefaultItem.bind(this);
  }

  componentDidMount(){
    this.getItemTypes();
  }

  getItemTypes(){
    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getItemType";
    fetch(url)
    .then(
      (response) => response.json()
    )
    .then(function(data){
      this.setState({itemTypes: data});
      this.setDefaultItem(data[0].ID)
    }.bind(this))

  }

  setDefaultItem(value){
    this.setState({itemType: value});
  }

  handleInputChange(event){
    const name = event.target.name;
    const value = event.target.value;
    this.setState({[name]: value});
  }

  handleItemPicChange(event){
    const name = event.target.name;
    const picName = name + "Name";
    const fileName = event.target.files[0].name;
    const file = event.target.files[0];

    this.setState({[picName]: fileName, [name]: file });
  }

  handleSubmit(event){
    event.preventDefault();
    let formData = new FormData();
    formData.append("itemName", this.state.itemName);
    formData.append("helpURL", this.state.helpURL);
    formData.append("totalCost", this.state.totalCost);
    formData.append("rentalPrice", this.state.rentalPrice);
    formData.append("itemType", this.state.itemType);
    formData.append("largeItemPic", this.state.largeItemPic, this.state.largeItemPicName);
    formData.append("smallItemPic", this.state.smallItemPic, this.state.smallItemPicName);

    //routing info for backend
    formData.append("data", "Inventory");
    formData.append("action", "addItem");

    let submit = {};
    const url = "https://dev.dma.ucla.edu/api/";
    let fetchOptions = {
      method: "POST",
      body: formData,
      credentials: 'same-origin'
    };
    //TODO: handle unauthorized errors
    fetch(url, fetchOptions)
    .then((response) => response.json())
    .then(function(json_data){
      if (json_data.success === true){
        this.setState({alert: true, alertMessage: "Add Successful", alertType: "success"});
      }
      else{
        this.setState({alert: true, alertMessage: json_data.error, alertType: "danger"});
      }
    }.bind(this));

    //TODO: on success, close modal, else display error
  }

  render(){
    const itemTypes = this.state.itemTypes.map((type) =>
      <option value={type.ID} key={type.ID}>{type.name}</option>
    );
    const alertType = this.state.alertType;
    const alert = this.state.alert ?
            (<div className={`alert alert-${alertType}`} role="alert">
                {this.state.alertMessage}
             </div>)
             : null;
    return (
      <form onSubmit={this.handleSubmit}>
        {alert}
        <TextInput name="itemName" label="Item Name"
          value={this.state.itemName} onChange={this.handleInputChange}/>

        <div className="form-group">
          <label htmlFor="largeItemPic">Large Picture of Item</label>
          <input id="largeItemPic" className="form-control-file"
                   type="file" name="largeItemPic"
                   onChange={this.handleItemPicChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="smallItemPic">Small Picture of Item</label>
          <input id="smallItemPic" className="form-control-file"
                   type="file" name="smallItemPic"
                   onChange={this.handleItemPicChange}/>
        </div>

        <TextInput name="helpURL" label="Help URL"
          value={this.state.helpURL} onChange={this.handleInputChange}/>

        <TextInput name="totalCost" label="Total Cost"
          value={this.state.totalCost} onChange={this.handleInputChange}/>

        <TextInput name="rentalPrice" label="Rental Price"
          value={this.state.rentalPrice} onChange={this.handleInputChange}/>

        <div className="form-group">
          <label htmlFor="itemType">Item Type</label>
          <select id="itemType" className="form-control" name="itemType"
            value={this.state.itemType} onChange={this.handleInputChange}>
            {itemTypes}
          </select>
        </div>

        <div className="form-group">
          <input type="submit" value="Submit"/>
        </div>

        <div className="form-group">
          <button onClick={this.props.closeModal}>close</button>
        </div>
      </form>
    );
  }
}


ReactDOM.render(
  <AddInvItemContainer/>,
  document.getElementById('root')
);
