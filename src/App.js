import React from 'react';
import './App.css';
import axios from 'axios';
import {Container, Row, Col, Form, Spinner, ListGroup} from 'react-bootstrap';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			search: '',
			loading: false,
			result: [],
		};

		this.handleOnChange = this.handleOnChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this);
		this._parseWeatherData = this._parseWeatherData.bind(this);
		this._renderSpinnerOrChart = this._renderSpinnerOrChart.bind(this);
	}

	handleOnChange(event) {
		const newState = {...this.state};
		newState.search = event.target.value;
		this.setState(newState);
	}

	handleOnSubmit(event) {
		event.preventDefault();

		const newState = {...this.state};
		newState.loading = true;
		newState.result = [];
		this.setState(newState);

		//const url = 'https://api.met.no/weatherapi/locationforecast/1.9/.json?lat='+newState.lat+';lon='+newState.lon;
		const location = newState.search;
		const url = 'https://api.weatherbit.io/v1.0/forecast/hourly/geosearch?city='+location+'&key=3025f627f2d5456f92e0b52cf752d758';

		axios.get(url).then((res) => {
			const newState = {...this.state};
			newState.result = this._parseWeatherData(res.data);
			newState.loading = false;
			this.setState(newState);
		}).catch((err) => {
			console.error(err);

			const newState = {...this.state};
			newState.loading = false;
			this.setState(newState);

			alert('Could not load weather data for location, please change your term or see the error log');
		});
	}

	render() {
		return (
			<div className="app">
				<Container>
					<Row>
						<Col className="text-left">
							<div className="attribution">Data provided by: <a href="https://www.weatherbit.io/">Weatherbit</a></div>
						</Col>
					</Row>

					<Row>
						<Col>
							<Form onSubmit={this.handleOnSubmit}>
								<Form.Group controlId="formLocation">
									<Form.Control type="text" placeholder="Location" autoFocus onChange={this.handleOnChange} />
								</Form.Group>
							</Form>
						</Col>
					</Row>

					<Row>
						<Col>
							{this._renderSpinnerOrChart()}
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	_parseWeatherData(data) {
		const result = {};

		for(const item of data.data) {
			const key = item['ts'];
			let tmp = null;

			if(result[key]) {
				tmp = result[key];
			} else {
				tmp = {
					'key': key,
					'date': item['timestamp_local'],
					'rain': 0,
					'temperature': 0,
					'windSpeed': 0,
					'windDirection': 0,
					'symbol': '',
					'description': '',
				}
			}

			tmp['symbol'] = item.weather.icon;
			tmp['description'] = item.weather.description;
			tmp['rain'] = item.precip.toFixed(3);
			tmp['temperature'] = item.temp;
			tmp['windSpeed'] = item.wind_spd.toFixed(2);
			tmp['windDirection'] = item.wind_dir;

			result[key] = tmp;
		};

		return Object.values(result);
	}

	_renderSpinnerOrChart() {
		if(!this.state.loading && this.state.result.length) {
			return (
				<div className="weather-output">
					<ListGroup className="list-group-horizontal">
						{this.state.result.map((item) => {
							const icon = 'https://www.weatherbit.io/static/img/icons/'+item.symbol+'.png';
							const style = {
								transform: "rotate("+item.windDirection+"deg)"
							};
							
							const d = new Date(item.date);
							const dateString = d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear();
							const timeString = d.toTimeString().substr(0,5);
							const temperature = Math.round(item.temperature);
							let rain;

							if(item.rain > 0 && item.rain < 1) {
								rain = "< 1";
							} else if(item.rain < 1) {
								rain = 0;
							} else {
								rain = parseFloat(item.rain).toFixed(2);
							}

							return (
								<ListGroup.Item key={item.key}>
									<div className="date-item">
										<div>{dateString}</div>
										<div>{timeString}</div>
									</div>
									<div><img src={icon} alt={item.description} title={item.description} width="64" height="64" /></div>
									<div>{temperature}&deg;</div>
									<div>{rain} mm</div>
									<div>
										{item.windSpeed} m/s
										<span className="wind-direction" style={style}>&#x2193;</span>
									</div>
								</ListGroup.Item>
							);
						})}
					</ListGroup>
				</div>
			)
		} else if(this.state.loading) {
			return (
				<Spinner animation="grow" />
			);
		} else {
			return null;
		}
	}
}

export default App;
