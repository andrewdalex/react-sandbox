import React from 'react';
import ReactDOM from 'react-dom';

// class ItemsContainer extends React

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
      <h4 className="card-title txt-center">{props.cardTitle}</h4>
      <p className="card-text">{props.cardText}</p>
      <Button className="mx-auto" linkText="Add to Cart" linkRef="#" />
    </div>
  </div>
  );
}

function Button(props){
  return(<a href={props.linkRef} className="btn btn-primary">{props.linkText}</a>);
}

const testItems = [1,2,3,4,5,6,7,8];
ReactDOM.render(
  <ItemsGrid itemList={testItems} />,
  document.getElementById('root')
);
