import React from 'react';
import ReactDOM from 'react-dom';

import {List, Table, Form, Input, Col, Select, DatePicker, Button, Alert, Upload, Icon} from 'antd';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const Dragger = Upload.Dragger;

const DAMAGE_STATUS = 0;
const IS_AVAILABLE = 1;

class EditableItem extends React.Component{
  constructor(props){
    super(props);
    const prevHelpURL = props.item.help_url;
    const prevRentalRate = props.item.rental_cost;
    const packages = props.packages;
    const form = {rentalRate: prevRentalRate,
                  helpUrl: prevHelpURL,
                  serials: {},
                  damageStatusUpdates: {},
                  availabilityUpdates: {},
                  newPackages: []
                 };
    this.state = {
                  packages: packages,
                  form: form,
                  status_key: [],
                  };
    this.createSelectHandler = this.createSelectHandler.bind(this);
    this.getDamageStatusKey = this.getDamageStatusKey.bind(this);
    this.pushChange = this.pushChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.createPackageDeleteHandler = this.createPackageDeleteHandler.bind(this);
    this.addPackage = this.addPackage.bind(this);
    this.createNewPackageInputHandler = this.createNewPackageInputHandler.bind(this);
    this.createNewPackageSelectHandler = this.createNewPackageSelectHandler.bind(this);
  }

  pushChange(event){
    event.preventDefault();
    const formData = this.state.form;
    formData['itemID'] = this.props.item.item_ID; //tack item ID on to changes before pushing up
    this.props.handleSubmit(formData);
  }

  addPackage(event){
    event.preventDefault();
    this.setState((prevState) => {
      const form = prevState.form;
      const newPackages = form.newPackages;
      const defaultPackageData = {
                                    pkg_number: "",
                                    damage_status: "1", //default damage status good (id 1)
                                    serial_number: ""
                                  };
      newPackages.push(defaultPackageData);
      return {form: form};
    });
  }

  componentDidMount(){
    this.getDamageStatusKey();
    //do non-trivial form autofill
    const serials = {};
    const packages = this.state.packages;
    packages.forEach((pkg) => {
      serials[pkg.pkg_id] = pkg.serial_number;
    });
    this.setState((prevState) => {
      const form = prevState.form;
      form.serials = serials;
      return {form:form};
    });

  }

  getDamageStatusKey(){
    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getDamageStatusKey";
    fetch(url)
    .then(
      (response) => response.json()
    )
    .then(function(data){
      this.setState({status_key: data['status_key']});
    }.bind(this))
  }

  createSelectHandler(packageID, version){
    if (version == IS_AVAILABLE){
      return function(value){
        this.setState((prevState) => {
          const form = prevState.form;
          form.availabilityUpdates[packageID] = value;
          return {form: form};
        });
      }.bind(this);
    }
    else if (version == DAMAGE_STATUS){
      return function(value){
        this.setState((prevState) => {
          const form = prevState.form;
          form.damageStatusUpdates[packageID] = value;
          return {form: form};
        });
      }.bind(this);
    }
    else{
      return ((value) => null);
    }
  }

  createPackageDeleteHandler(packageID){
    return function(event){
      event.preventDefault();
      const url = "https://dev.dma.ucla.edu/api/";
      const formData = new FormData();
      formData.append("data", "Inventory");
      formData.append("action", "deletePackage");
      formData.append("packageID", packageID);
      const fetchOptions = {
        method: "POST",
        body: formData
        //credentials: 'same-origin'
      }
      fetch(url, fetchOptions)
      .then((response) => {
        return response.json();
      })
      .then(function(data){
        if (data["success"]){
          this.setState((prevState) => {
            const packages = prevState.packages;
            const pkgIdx = packages.findIndex((pkg) => pkg.pkg_id == packageID);
            packages.splice(pkgIdx,1);
            return {packages: packages};
          })
        }
        else{
          alert("Could not delete package");
        }
      }.bind(this))
    }.bind(this);
  }

  handleInputChange(event){
    event.preventDefault();
    const name = event.target.name;
    const value = event.target.value;
    this.setState((prevState) => {
      const form = prevState.form;
      form[name] = value;
      return {form: form};
    });
  }

  createSerialHandler(packageID){
    return function(event){
      event.preventDefault();
      const value = event.target.value;
      this.setState((prevState) => {
        const form = prevState.form;
        form.serials[packageID] = value;
        return {form: form}
      });
    }.bind(this);
  }

  createNewPackageInputHandler(addKey){
    return function(event){
      event.preventDefault();
      const name = event.target.name;
      const value = event.target.value;
      this.setState((prevState) => {
        const form = prevState.form;
        form.newPackages[addKey][name] = value;
        return {form: form}
      });
    }.bind(this);
  }

  createNewPackageSelectHandler(addKey){
    return function(value){
      this.setState((prevState) => {
        const form = prevState.form;
        form.newPackages[addKey]["damage_status"] = value;
        return {form: form};
      });
    }.bind(this);
  }

  createNewPackageDeleter(pkgIdx){
    return function(event){
      this.setState((prevState) => {
        const form = prevState.form;
        form.newPackages.splice(pkgIdx,1);
        return {form: form};
      });
    }.bind(this);
  }


  render(){

    const formState = this.state.form;
    const damageStatusOptions = this.state.status_key.map((stat) =>
        <Option key={stat.ID} value={stat.ID}>{stat.name}</Option>
      );

    const newPackages = formState.newPackages.map((pkg, idx) =>
      <FormItem key={idx} label={"New Package " + (parseInt(idx) + 1)}>
        <InputGroup>
          <Col span={6}>
            <Input name="pkg_number" value={formState.newPackages[idx].pkg_number}
                   onChange={this.createNewPackageInputHandler(idx)} placeholder="Package Number"
                   style={{ width: 250 }}/>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Package Damage Status"
              defaultValue="good"
              onChange={this.createNewPackageSelectHandler(idx)}
              style={{ width: 250 }}>
              {damageStatusOptions}
            </Select>
          </Col>
          <Col span={6}>
            <Input name="serial_number" value={formState.newPackages[idx].serial_number}
                   onChange={this.createNewPackageInputHandler(idx)} placeholder="Serial Number"/>
          </Col>
          <Col span={2}>
            <Button type="danger" shape="circle" icon="close-circle-o" onClick={this.createNewPackageDeleter(idx)}/>
          </Col>
        </InputGroup>
      </FormItem>
    );

    const editablePackages = this.state.packages.map((pkg) =>
        <FormItem key={pkg.pkg_id} label={pkg.item_name + " " + pkg.pkg_number}>
          <InputGroup>
            <Col span={6}>
              <Select
                placeholder="Package Availibility"
                defaultValue={pkg.status == "Available" ? "available" : "not_available"}
                style={{ width: 250 }}
                onChange={this.createSelectHandler(pkg.pkg_id,IS_AVAILABLE)}>
                <Option value="available">Available</Option>
                <Option value="not_available">Not Available</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Package Damage Status"
                defaultValue={pkg.damage_status}
                onChange={this.createSelectHandler(pkg.pkg_id,DAMAGE_STATUS)}
                style={{ width: 250 }}>
                {damageStatusOptions}
              </Select>
            </Col>
            <Col span={6}>
              <Input value={formState.serials[pkg.pkg_id]}
                     onChange={this.createSerialHandler(pkg.pkg_id)} placeholder="Serial Number"/>
            </Col>
            <Col span={2}>
              <Button type="danger" shape="circle" icon="close-circle-o" onClick={this.createPackageDeleteHandler(pkg.pkg_id)}/>
            </Col>
          </InputGroup>
        </FormItem>
      );

    return <div>
            <Form onSubmit={this.pushChange}>
              <FormItem>
                <Col span={5}>
                  <Input name="rentalRate" value={formState['rentalRate']}
                         onChange={this.handleInputChange} placeholder="Rental Rate" />
                </Col>
              </FormItem>
              <FormItem>
                <Col span={5}>
                  <Input name="helpUrl" value={formState['helpUrl']}
                         onChange={this.handleInputChange} placeholder="Help Url" />
                </Col>
              </FormItem>
              <h3>Packages</h3>
              {editablePackages}
              {formState.newPackages.length > 0 ?
              <div>
                <h3>Newly Added Packages</h3>
                {newPackages}
              </div> : ""}
              <FormItem>
                <Col span={3}>
                  <Button type="primary" htmlType="submit">Submit Changes</Button>
                </Col>
                <Col span={3}>
                  <Button htmlType="button" onClick={this.addPackage}>Add Package</Button>
                </Col>
              </FormItem>
            </Form>
          </div>
    }
}





class ItemDetail extends React.Component{
  constructor(props){
    super(props);
    const isEditable = this.props.isEditable;
    this.state = {
      isEditable : isEditable,
      alert : false,
      alertMessage : "",
      alertType : "",
    };
    this.pushItemChange = this.pushItemChange.bind(this);
  }

  componentWillReceiveProps(nextProps){
    if (this.props.isEditable != nextProps.isEditable){
      this.setState({isEditable: nextProps.isEditable});
    }
  }

  pushItemChange(changeData){
    const formData = new FormData();

    //append routing info to form data for backend processing
    formData.append("data", "Inventory");
    formData.append("action", "pushItemChange");

    //now the changes made...
    formData.append("changeData", JSON.stringify(changeData));

    const url = "https://dev.dma.ucla.edu/api/";
    const fetchOptions = {
      method: "POST",
      body: formData
      //credentials: 'same-origin'
    };

    fetch(url, fetchOptions)
    .then((response) => {
      if (response.ok){
        const text = response.text();
        return text;
      }
    })
    .then(function(text){
      const json_data = JSON.parse(text);
      if (json_data.success == true){
        this.props.refreshItemData();
        this.setState({alert: true, alertMessage: "Update Successful", alertType: "success"});
        this.props.toggleEdit();
      }
      else{
        this.setState({alert: true, alertMessage: json_data.error_text, alertType: "failure"});
      }
    }.bind(this))
  }

  render(){
    const item = this.props.item;
    const checkedOutPckgs = this.props.allCheckedOutPackages;
    const reservedPckgs = this.props.allReservedPackages;
    const packages = this.props.packages.map((pckg) =>
          ({
            item_name: pckg.item_name,
            pkg_number: pckg.pkg_number,
            status: checkedOutPckgs.includes(pckg.package_ID) ? "Checked Out" : "Available",
            damage_status: pckg.status_text,
            pkg_id: pckg.package_ID,
            serial_number: pckg.serial_number
          }))
          .sort((a,b) => a.pkg_number - b.pkg_number);


    const columns = [{
        title: 'Name',
        dataIndex: 'item_name',
        key: 'item_name',
      }, {
        title: 'Package Number',
        dataIndex: 'pkg_number',
        key: 'pkg_number',
      }, {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },{
        title: "Damage Status",
        dataIndex: 'damage_status',
        key: 'damage_status'
      },
      {title: "Serial Number",
       dataIndex: "serial_number",
       key: "serial_number"
     }];

    const showAlert = this.state.alert;
    const alertMessage = this.state.alertMessage;
    const alertType = this.state.alertType;
    const noEdit = (
                    <div>
                      {showAlert ? <Alert message={alertMessage} type={alertType}/> : ""}
                      <p>Rental Rate: ${item.rental_cost} / Day</p>
                      <RangePicker size={'default'} />
                      <Table dataSource={packages} columns={columns} rowKey="pkg_id"/>
                    </div>
    );


    return this.state.isEditable ? <EditableItem item={item}
                                            handleSubmit={this.pushItemChange}
                                            packages={packages}/> : noEdit;
  }
}





class ItemList extends React.Component{
  constructor(props){
    super(props);
    this.state = {itemList: [], uniqueItems: [],
                  itemsDetailed: {}, checkedOutPckgs: [],
                  reservedPckgs: [], status_key: [], package_statuses: [],
                  itemsEditable: {},
                };
    this.getAvailable = this.getAvailable.bind(this);
    this.isDetailed = this.isDetailed.bind(this);
    this.toggleDetail = this.toggleDetail.bind(this);
    this.createEditToggler = this.createEditToggler.bind(this);

  }

  filterItemsforPackages(item_id){
    return this.state.itemList.filter((item) => item.item_ID == item_id);
  }


  getAvailable(){
    const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getAvailable";
    fetch(url)
    .then(
      (response) => response.json()
    )
    .then(function(data){
      this.setState({itemList: data['all_items']});
      const uniqueItems = data['all_items'].filter(function(item, idx, arr){
        return arr.findIndex((item_2) => item_2.item_ID === item.item_ID ) === idx
      });
      this.setState({uniqueItems: uniqueItems});
      this.setState({checkedOutPckgs: data['checked_out_ids']});
      this.setState({reservedPckgs: data['reserved_ids']});
    }.bind(this))
  }


  componentDidMount(){
    this.getAvailable();
  }


  toggleDetail(item_ID){

    return function(event){
      event.preventDefault();
      this.setState((prevState) => {
        const itemsDetailed = prevState.itemsDetailed;
        const itemsEditable = prevState.itemsEditable;
        if (itemsDetailed[item_ID]){
          delete itemsDetailed[item_ID];
          if (itemsEditable[item_ID]){
            delete itemsEditable[item_ID]; //make sure edit mode if off once toggled
          }
        }
        else{
          itemsDetailed[item_ID] = true;
        }
        return {itemsEditable: itemsEditable, itemsDetailed: itemsDetailed};
      });
    }.bind(this);

  }


  isDetailed(item_ID){
    return this.state.itemsDetailed[item_ID];
  }

  toggleEdit(item_ID){
    this.setState((prevState) => {
      const itemsEditable = prevState.itemsEditable;
      const itemsDetailed = prevState.itemsDetailed;
      if (itemsEditable[item_ID]){
        delete itemsEditable[item_ID];
      }
      else{
        itemsEditable[item_ID] = true;
        itemsDetailed[item_ID] = true; //also make sure detail is shown so edit page is visbile automatically
      }
      return {itemsEditable: itemsEditable, itemsDetailed: itemsDetailed}
    });
  }

  createEditToggler(item_ID){
    return function(event){
      event.preventDefault();
      this.toggleEdit(item_ID);
    }.bind(this);
  }


  isEditable(item_ID){
    return this.state.itemsEditable[item_ID];
  }


  render(){
    return <List
    itemLayout="vertical"
    dataSource={this.state.uniqueItems}
    renderItem={item => (
      <List.Item actions={[<a onClick={this.createEditToggler(item.item_ID)}>{this.isEditable(item.item_ID) ? "view" : "edit"}</a>,
                          <a onClick={this.toggleDetail(item.item_ID)}>{this.isDetailed(item.item_ID) ? "less" : "more"}</a>]}
                 key={item.item_ID}>

        <List.Item.Meta
          title={item.item_name}
          description={item.contents}
        />

        <a href={"https://dev.dma.ucla.edu/includes/images/reservation/pkg_lg/" + item.photo_url}>
          <img src={"https://dev.dma.ucla.edu/includes/images/reservation/pkg_sm/" + item.photo_url}/>
        </a>
        {this.isDetailed(item.item_ID) ?
            <ItemDetail item={item}
                        refreshItemData={this.getAvailable}
                        isEditable={this.isEditable(item.item_ID)}
                        allCheckedOutPackages = {this.state.checkedOutPckgs}
                        allReservedPackages = {this.state.reservedPckgs}
                        toggleEdit={this.toggleEdit.bind(this, item.item_ID)}
                        packages={this.filterItemsforPackages(item.item_ID)}
                        statusKey={this.state.status_key}/>
          : "" }

      </List.Item>
    )}
  /> //close List component
  }
}



ReactDOM.render(
  <ItemList/>,
  document.getElementById('root')
);
