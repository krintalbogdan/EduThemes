import React, { useState } from 'react';
import { Button, Container} from 'react-bootstrap';
import { Chart as ChartJS, Title} from 'chart.js/auto';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import './Analyze.css';
import sourceData from '../Test_Data/source.json';

const Analyze = () => {


    return (
        <div className='d-flex'>

            <Container className="d-flex justify-content-center align-items-center bg-dark rounded-5 gap-3 " style={{ height: '90vh', width: '180vw' }}>
                <div className='d-flex flex-column justify-content-between align-items-left' style={{ width: '40%', height: '90%' }}>
                    <div className="bg-white rounded-5 d-flex justify-content-center align-items-center" style={{ width: '90%', height: '45%' }}>
                        <Doughnut 
                            data={{
                                labels: sourceData.map(item => item.label),
                                datasets: [
                                    {
                                        label: "Count",
                                        data: sourceData.map(item => item.value),
                                        backgroundColor: [
                                            "rgba(43, 63, 229, 0.8)",
                                            "rgba(150, 185, 67, 0.8)",
                                            "rgba(180, 42, 42, 0.8)",
                                        ],
                                        borderColor: [
                                            "rgba(43, 63, 229, 0.8)",
                                            "rgba(150, 185, 67, 0.8)",
                                            "rgba(180, 42, 42, 0.8)",
                                        ],
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                    },
                                    title: {
                                        display: true,
                                        text: 'Data - title',
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="bg-white rounded-5 d-flex justify-content-center align-items-center p-4" style={{ width: '90%', height: '45%' }}>
                        <Bar 
                            data={{
                                labels: sourceData.map(item => item.label),
                                datasets: [
                                    {
                                        label: "Count",
                                        data: sourceData.map(item => item.value),
                                        backgroundColor: [
                                            "rgba(43, 63, 229, 0.8)",
                                            "rgba(150, 185, 67, 0.8)",
                                            "rgba(180, 42, 42, 0.8)",
                                        ],
                                        borderColor: [
                                            "rgba(43, 63, 229, 0.8)",
                                            "rgba(150, 185, 67, 0.8)",
                                            "rgba(180, 42, 42, 0.8)",
                                        ],
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                    },
                                    title: {
                                        display: true,
                                        text: 'Data - title',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
                

                <div className="bg-light rounded-5 d-flex flex-column justify-content-center align-items-center p-4" style={{ width: '50%', height:'90%'}}>
                    <Container fluid className='bg-dark rounded-5 p-5 text-white mb-5 
                        flex flex-wrap gap-3' 
                        style={{ width: '90%', height: '80%'}}>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">ETC</button>
                        <button class="pill" type="button">Engaged</button>
                        <button class="pill" type="button">Something</button>
                        <button class="pill" type="button">name</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">Happy</button>
                        <button class="pill" type="button">ETC</button>
                        <button class="pill" type="button">Engaged</button>
                        <button class="pill" type="button">Something</button>
                        <button class="pill" type="button">name</button>

                    </Container>
                    <div className='d-flex gap-5' style={{ width: '90%', height: '10%'}}>
                        <Button className='rounded-5 w-50 h-10' >
                            <span className='size-3'>
                                Download CSV

                            </span>
                        </Button>
                        <Button className='rounded-5 w-50 h-10' >
                            <span>
                                Return

                            </span>
                        </Button>
                    </div>
                        
                </div>
                
            </Container>
            <div className=' bg-dark rounded-5 gap-3' style={{width: '40%'}}> hi </ div>
            
        </div>

        
    );

}

export default Analyze;