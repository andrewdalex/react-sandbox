import React from 'react';
import ReactDOM from 'react-dom';

class ReservationCart extends React.Component {
  constructor(props){
    super(props);
    this.state = {cartItems: []};
  }

  addToCart(new_item){
    let item = this.state.cartItems.find( arg => new_item.item_ID === arg.item_ID);
    if (item){
      item.quantity++;
    }
    else{
      this.state.cartItems.push(item);
    }
    this.setState({cartItems: cartItems});
  }

}

class ItemsGridContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {itemList:[]};
    this.getAvailable = this.getAvailable.bind(this);
  }

  getAvailable(){
    // Development URL
    const url = "available.json";
    // Testing URL
    // const url = "https://dev.dma.ucla.edu/api/?data=Inventory&action=getAvailable";
    fetch(url)
    .then(
      (response) => response.json();
    )
    .then(function(data){
      this.setState({itemList: data});
    }.bind(this))

  }

  componentDidMount(){
    this.getAvailable();
  }

  render(){
    return <ItemsGrid itemList={this.state.itemList} />
  }
}

function ItemsGrid(props){
  let uniqueItems = props.itemList.filter(function(item, idx, arr){
    return arr.findIndex((item_2) => item_2.item_ID === item.item_ID ) === idx
  });

  let itemCounts = props.itemList.reduce(function(acc, obj){
    acc[obj.item_ID] ? acc[obj.item_ID]+=1 : acc[obj.item_ID] = 1;
    return acc;
  }, {});

  const itemStyle = {
    // marginBottom: "25px",
    // minWidth: "px"
  };
  return(
  <div className="container">
    <div className="row">
      {
        uniqueItems.map((item) =>
          <div className="col-xs-12 col-md-6 col-lg-4 mb-3" style={itemStyle} key={item.package_ID}>
            <Card cardTitle={item.item_name}
                  cardText={"Rental Cost: " + item.rental_cost + " Count: " + itemCounts[item.item_ID]}
                  cardImgSrc={"https://dev.dma.ucla.edu/includes/images/reservation/pkg_sm/" + item.photo_url}/>
          </div>
      )}
    </div>
  </div>);

}

function Card(props){
  const cardStyle = {
    // minHeight: "250px"
  };
  const imgStyle = {
    width: "150px",
    height: "80px"
  };
  return(
  <div className="card bg-light mx-auto" style={cardStyle}>
    <img className="card-img-top mx-auto" style={imgStyle} src={props.cardImgSrc} alt="item image"/>
    <div className="card-body">
      <h5 className="card-title text-center">{props.cardTitle}</h5>
      <p className="card-text text-center">{props.cardText}</p>
    </div>
    <div className="card-footer text-center">
      <Button linkText="Add to Cart" linkRef="#" />
    </div>
  </div>
  );
}

function Button(props){
  return(<a href={props.linkRef} className="btn btn-primary">{props.linkText}</a>);
}

ReactDOM.render(
  <ItemsGridContainer />,
  document.getElementById('root')
);
