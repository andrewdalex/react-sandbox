import React from 'react';
import ReactDOM from 'react-dom';

import {List} from 'antd';

function ItemDetail(props){
  const item = props.item;
  const isEditable = props.isEditable;
  const onSubmit = props.onSubmit;
  const checkedOutPckgs = props.allCheckedOutPackages;
  const reservedPckgs = props.allReservedPackages;
  const packages = props.packages.map((pckg) =>
              <tr>
                <td>{pckg.item_name}</td>
                <td>{pckg.pkg_number}</td>
                <td>{checkedOutPckgs.includes(pckg.package_ID) ? "Checked Out" : "Available"}</td>
              </tr>);
  return <div>
          <p>Rental Rate: ${item.rental_cost} / Day</p>
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Package Number</td>
                <td>Status</td>
              </tr>
            </thead>
            <tbody>
              {packages}
            </tbody>
          </table>
         </div>
}
class ItemList extends React.Component{
  constructor(props){
    super(props)
    this.state = {itemList: [], uniqueItems: [], itemsDetailed: {}, checkedOutPckgs: [], reservedPckgs: []};
    this.getAvailable = this.getAvailable.bind(this);
    this.isDetailed = this.isDetailed.bind(this);
    this.toggleDetail = this.toggleDetail.bind(this);

  }

  filterItemsforPackages(item_id){
    return this.state.itemList.filter((item) => item.item_ID == item_id);
  }
  getAvailable(){
    // Testing URL
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

  //stub code, implement later
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



  render(){
    return <List
    itemLayout="vertical"
    dataSource={this.state.uniqueItems}
    renderItem={item => (
      <List.Item actions={[<a>edit</a>,
                          <a onClick={this.toggleDetail(item.item_ID)}>{this.isDetailed(item.item_ID) ? "less" : "more"}</a>]}>
        <List.Item.Meta
          title={<a href="https://ant.design">{item.item_name}</a>}
          description="Ant Design, a design language for background applications, is refined by Ant UED Team"
        />

        {/* TODO: Change the mechanism for displaying large photos so items don't have to be refetched */}
        <a href={"https://dev.dma.ucla.edu/includes/images/reservation/pkg_lg/" + item.photo_url}>
          <img src={"https://dev.dma.ucla.edu/includes/images/reservation/pkg_sm/" + item.photo_url}/>
        </a>
        {this.isDetailed(item.item_ID) ?
            <ItemDetail item={item}
                        isEditable={false}
                        onSubmit={() => null}
                        allCheckedOutPackages = {this.state.checkedOutPckgs}
                        allReservedPackages = {this.state.reservedPckgs}
                        packages={this.filterItemsforPackages(item.item_ID)}/>
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
