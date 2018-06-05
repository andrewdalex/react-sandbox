import React from 'react';
import ReactDOM from 'react-dom';

import {List, Table, Form, Input, Col, Select, DatePicker, Button, Alert} from 'antd';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

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
                  availabilityUpdates: {}
                 };
    this.state = {packages: packages,
                  form: form,
                  status_key: [],
                  };
    this.createSelectHandler = this.createSelectHandler.bind(this);
    this.getDamageStatusKey = this.getDamageStatusKey.bind(this);
    this.pushChange = this.pushChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  pushChange(event){
    event.preventDefault();
    const formData = this.state.form;
    formData['itemID'] = this.props.item.item_ID; //tack item ID on to changes before pushing up
    this.props.handleSubmit(formData);
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


  render(){
    const formState = this.state.form;
    const damageStatusOptions = this.state.status_key.map((stat) =>
      <Option value={stat.ID}>{stat.name}</Option>
    );
    const editablePackages = this.state.packages.map((pkg) =>
      <FormItem label={pkg.item_name + " " + pkg.pkg_number}>
        <InputGroup size="large">
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
              {editablePackages}
              <FormItem>
                <Button type="primary" htmlType="submit">Make Changes</Button>
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

    //TODO: Create conf file to load endpoints from
    const url = "https://dev.dma.ucla.edu/api/";
    let fetchOptions = {
      method: "POST",
      body: formData
      //credentials: 'same-origin'
    };

    fetch(url, fetchOptions)
    .then((response) => {
      if (response.ok){
        const text = response.text();
        console.log(text);
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
                      <Table dataSource={packages} columns={columns} />
                    </div>
    );


    return this.state.isEditable ? <EditableItem item={item}
                                            handleSubmit={this.pushItemChange}
                                            packages={packages}/> : noEdit;
  }
}





class ItemList extends React.Component{
  constructor(props){
    super(props)
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
      this.setState({uniqueItems: uniqueItems})
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
      let itemsDetailed = this.state.itemsDetailed;
      if (itemsDetailed[item_ID]){
        delete itemsDetailed[item_ID];
      }
      else{
        itemsDetailed[item_ID] = true;
      }
      this.setState({itemsDetailed: itemsDetailed});
      return;
    }.bind(this);

  }


  isDetailed(item_ID){
    return this.state.itemsDetailed[item_ID];
  }

  toggleEdit(item_ID){
    let itemsEditable = this.state.itemsEditable;
    if (itemsEditable[item_ID]){
      delete itemsEditable[item_ID];
    }
    else{
      itemsEditable[item_ID] = true;
    }
    this.setState({itemsEditable: itemsEditable});
    return
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
                          <a onClick={this.toggleDetail(item.item_ID)}>{this.isDetailed(item.item_ID) ? "less" : "more"}</a>]}>
        <List.Item.Meta
          title={<a href="https://ant.design">{item.item_name}</a>}
          description="Item Description to go Here"
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
  />
  }
}



ReactDOM.render(
  <ItemList/>,
  document.getElementById('root')
);
