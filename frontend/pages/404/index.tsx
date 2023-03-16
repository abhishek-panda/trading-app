import React from 'react';
import './style.css'


const Error404 =  () => {
	return (
		<div className='error404'>
			<h1>404 Page Not Found</h1>
			<section className="error404__section">
				<span>
					<span>4</span>
				</span>
				<span>0</span>
				<span>
					<span>4</span>
				</span>
			</section>
			<div className="error404__message">Maybe this page moved? Got deleted? Is hiding out in quarantine? Never existed in the first place?
				<p>Let's go <a href="/">home</a> and try from there.</p>
			</div>
		</div>
	)
}

export default Error404;
