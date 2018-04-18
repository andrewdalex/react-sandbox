import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';



export class InvItemFormContainer extends React.Component{
  constructor(props){
    console.log("constructor called");
    super(props);
    this.state = {modalIsOpen: props.modalIsOpen,
                  isEdit: props.isEdit};
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
      {!this.state.isEdit &&
      <button onClick={this.openModal}>Add Item to Inventory</button>
      }
      <Modal
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeModal}
      >
        <div className="row">
          <div className="col-md-4">
          </div>
          <div className="col-md-4">
            <h2>Add Inventory</h2>
          </div>
          <div className="col-md-4">
            <button onClick={this.closeModal} type="button" className="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        {/* TODO: May be able to remove closeModal prop after testing */}
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
    <div>
      {/* <label htmlFor={props.name}>{props.label}</label> */}
      <input id={props.name} className={`form-control ${validInputClass}`} type="text"
        name={props.name} value={props.value} onChange={props.onChange}
        placeholder={props.placeholder ? props.placeholder : ""}
      />
      {feedback}
    </div>
  );
}



function FormRow(props){
  return (
  <div className="form-row">
    {props.children}
  </div>
  );
}



function FormGroup(props){
  return (
    <div className={`form-group ${props.width && 'col-md-' + props.width}`}>
      {props.children}
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
                  damageStatuses: [],
                  helpURL: '',
                  alert: false,
                  alertMessage: "",
                  alertType: "",
                  packages: []
                };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleItemPicChange = this.handleItemPicChange.bind(this);
    this.getItemTypes = this.getItemTypes.bind(this);
    this.setDefaultItem = this.setDefaultItem.bind(this);
    this.appendPackageForm = this.appendPackageForm.bind(this);
    this.handlePackageFormChange = this.handlePackageFormChange.bind(this);
    this.removePackageForm = this.removePackageForm.bind(this);
    this.getDamageStatuses = this.getDamageStatuses.bind(this);
  }



  componentDidMount(){
    this.getItemTypes();
    this.getDamageStatuses();
  }



  getItemTypes(retries = 10){
    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getItemType";
    fetch(url)
    .then(function(response){
      if (response.ok){
        return response.json()
      }
      throw new Error("Network Failure");
    })
    .then(function(json_data){
      this.setState({itemTypes: json_data});
      this.setDefaultItem('itemType', json_data[0].ID);
    }.bind(this))
    .catch(function(error){
      if (retries > 0){
        setTimeout(this.getItemTypes, 250, retries-1)
      }
      else{
        this.setState({alert: true, alertMessage: "Failed to fetch item types, check your network connection", alertType: "danger"});
      }
    }.bind(this))

  }



  getDamageStatuses(retries = 10){
    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getDamageStatuses";
    fetch(url)
    .then(function(response){
      if (response.ok){
        return response.json()
      }
      throw new Error("Network Failure");
    })
    .then(function(json_data){
      this.setState({damageStatuses: json_data});
    }.bind(this))
    .catch(function(error){
      if (retries > 0){
        setTimeout(this.getDamageStatuses, 250, retries-1)
      }
      else{
        this.setState(alert: true,
                      alertMessage: "Failed to fetch damage statues, check your network connection",
                      alertType: "danger");
      }
    }.bind(this))
  }

  setDefaultItem(stateVar, value){
    this.setState({[stateVar]: value});
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

  handleSubmit(event, retries=5, retry=false){
    if (!retry){
      this.setState({alert: true, alertMessage: "Submitting...", alertType: "primary"});
    }
    event.preventDefault();
    event.persist();
    let formData = new FormData();
    formData.append("itemName", this.state.itemName);
    formData.append("helpURL", this.state.helpURL);
    formData.append("totalCost", this.state.totalCost);
    formData.append("rentalPrice", this.state.rentalPrice);
    formData.append("itemType", this.state.itemType);
    formData.append("largeItemPic", this.state.largeItemPic, this.state.largeItemPicName);
    formData.append("smallItemPic", this.state.smallItemPic, this.state.smallItemPicName);
    formData.append("packages" , JSON.stringify(this.state.packages));

    //routing info for backend
    formData.append("data", "Inventory");
    formData.append("action", "addItem");

    let submit = {};
    const url = "https://dev.dma.ucla.edu/api/";
    let fetchOptions = {
      method: "POST",
      body: formData
      //credentials: 'same-origin'
    };
    //TODO: handle unauthorized errors
    fetch(url, fetchOptions)
    .then((response) => {
      if (response.ok){
        return response.text()
      }
      throw new Error("Network Failure");
    })
    .then(function(text){
      const json_data = JSON.parse(text);
      if (json_data.success === true){
        this.setState({alert: true, alertMessage: "Add Successful", alertType: "success"});
      }
      else{
        this.setState({alert: true, alertMessage: json_data.error, alertType: "danger"});
      }
    }.bind(this))
    .catch(function(error){
      if (retries > 0){
        setTimeout(this.handleSubmit, 1000, event, retries-1, true);
        console.log("Retrying, " + retries + " left");
      }
      else{
        this.setState({alert:true,
                       alertMessage:  "Check your network connection, could not submit form",
                       alertType: "danger"
                     });
      }

    }.bind(this));

  }

  removePackageForm(package_id){
    return function(event){
      event.preventDefault()
      this.setState((prevState) =>{
        prevState.packages.splice(package_id,1);
        return {packages: prevState.packages};
      });

    }.bind(this);
  }

  appendPackageForm(event){
    event.preventDefault();
    //TODO: may want to find a more "conventional", extendable way to set defaults...
    const packageData = {serialNumber: "", damageStatus: "1"};
    this.setState((prevState) => (
      {packages: [...prevState.packages, packageData]}
    ));
  }

  handlePackageFormChange(package_id){
    return function(event){
      event.preventDefault();
      const name = event.target.name;
      const newValue = event.target.value;
      this.setState((prevState) => {
        const packages = [...prevState.packages];
        packages[package_id][name] = newValue;
        return {packages: packages};
      });
    }.bind(this);
  }


  render(){
    const itemTypes = this.state.itemTypes.map((type) =>
      <option value={type.ID} key={type.ID}>{type.name}</option>
    );

    const addPackageForms = this.state.packages.map((pkg_vals, idx) =>
      <AddPackageForm key={idx} serialNumber={pkg_vals.serialNumber}
        handleFormChange={this.handlePackageFormChange(idx)}
        removeForm={this.removePackageForm(idx)}
        damageStatuses={this.state.damageStatuses}
        damageStatus={pkg_vals.damageStatus}
        seqNum={idx}/>
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

        <FormRow>
          <FormGroup width={6}>
            <TextInput name="itemName" placeholder="Item Name"
            value={this.state.itemName} onChange={this.handleInputChange}/>
          </FormGroup>
          <FormGroup width={6}>
            <TextInput name="helpURL" placeholder="Help URL"
              value={this.state.helpURL} onChange={this.handleInputChange}/>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup width={4} >
            <label htmlFor="largeItemPic">Large Picture of Item</label>
            <input id="largeItemPic" className="form-control-file"
                   type="file" name="largeItemPic"
                   onChange={this.handleItemPicChange}/>
          </FormGroup>

          <FormGroup width={4}>
            <label htmlFor="smallItemPic">Small Picture of Item</label>
            <input id="smallItemPic" className="form-control-file"
                     type="file" name="smallItemPic"
                     onChange={this.handleItemPicChange}/>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup width={4}>
            <TextInput name="totalCost" placeholder="Total Cost"
              value={this.state.totalCost} onChange={this.handleInputChange}/>
          </FormGroup>

          <FormGroup width={4}>
            <TextInput name="rentalPrice" placeholder="Rental Price"
              value={this.state.rentalPrice} onChange={this.handleInputChange}/>
          </FormGroup>

          <FormGroup width={4}>
            <label htmlFor="itemType">Item Type</label>
            <select id="itemType" className="form-control" name="itemType"
              value={this.state.itemType} onChange={this.handleInputChange}>
              {itemTypes}
            </select>
          </FormGroup>
        </FormRow>

        {addPackageForms}

        <FormGroup>
          <button onClick={this.appendPackageForm}>Add Package</button>
        </FormGroup>

        <FormRow>
          <FormGroup width={1}>
            <input type="submit" value="Submit" className="btn btn-outline-success"/>
          </FormGroup>
        </FormRow>
      </form>
    );
  }
}


class AddPackageForm extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    const damageStatus = this.props.damageStatus;
    const damageStatuses = this.props.damageStatuses;
    const statusOpts = damageStatuses.map((status) =>
      <option value={status.ID} key={status.ID}>{status.name}</option>
    );
    return (
      <div>
        <h5>Package {this.props.seqNum + 1}</h5>
        <FormGroup>
          <button type="button" onClick={this.props.removeForm} className="btn btn-outline-danger btn-sm">Remove Package</button>
        </FormGroup>
        <FormRow>
          <FormGroup width={3}>
            <TextInput name="serialNumber" placeholder="Serial Number"
              value={this.props.serialNumber} onChange={this.props.handleFormChange}/>
          </FormGroup>

          <FormGroup width={3}>
            <label htmlFor="damageStatus">Damage Status</label>
            <select id="damageStatus" className="form-control" name="damageStatus"
              value={damageStatus ? damageStatus : damageStatuses[0].ID} onChange={this.props.handleFormChange}>
              {statusOpts}
            </select>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

ReactDOM.render(
  <InvItemFormContainer/>,
  document.getElementById('root')
);
