import React from 'react';
import ReactDOM from 'react-dom';

class ItemsGridContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {itemList:[]};
  }

  getAvailable(){
    let items = [];
    fetch("https://dev.dma.ucla.edu/api/?data=Inventory&action=getAvailable")
    .then(function(response){
      return response.json()
    })
    .then(function(data){
      items = data;
    })

    this.setState({itemList: items});
  }

  componentDidMount(){
    this.getAvailable();
  }

  render(){
    return <ItemsGrid itemList={this.state.itemList} />
  }
}

function ItemsGrid(props){
  let itemList = props.itemList.slice(0);
  let gridItems = [];
  const maxRowLength = 3;

  return(
  <div className="container">
    <div className="row">
      {
        props.itemList.map((item,idx) =>
          <div className="col-xs-12 col-sm-6 col-md-4" key={idx}>
            <Card cardTitle="Card Title" cardText="Card Text" />
          </div>
      )}
    </div>
  </div>);

}

function Card(props){
  const cardStyle = {
    // width: "20rem"
  };
  return(
  <div className="card bg-light mx-auto" style={cardStyle}>
    <img className="card-img-top" src="..." alt="Card image cap"/>
    <div className="card-body">
      <h4 className="card-title">{props.cardTitle}</h4>
      <p className="card-text">{props.cardText}</p>
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
