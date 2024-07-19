import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

const ModalUpdateCage = ({ data, isModalOpen, handleClose }) => {
    const [updatedCage, setUpdatedCage] = useState(data);

    useEffect(() => {
        setUpdatedCage(data);
    }, [data]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedCage(prevCage => ({
            ...prevCage,
            [name]: value
        }));
    };

    const handleUpdateCage = async () => {
        try {
            const response = await axios.put(`http://localhost:8081/api/v1/animalCage/updateAnimalCage`, updatedCage);
            console.log(response.data.message);
            handleClose();
        } catch (error) {
            console.error("Update cage error:", error);
        }
    };

    return (
        <Dialog header="Update Cage" visible={isModalOpen} style={{ width: '50vw' }} onHide={handleClose}>
            <div className="p-grid p-fluid">
                <div className="p-col-12 p-md-6">
                    <label htmlFor="animalCageName">Cage Name</label>
                    <InputText
                        id="animalCageName"
                        name="animalCageName"
                        value={updatedCage.animalCageName}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="p-col-12 p-md-6">
                    <label htmlFor="areaId">Area</label>
                    <Dropdown
                        value={updatedCage.areaId}
                        onChange={handleInputChange}
                        options={data.areas}
                        optionLabel="areaName"
                        placeholder="Select an Area"
                        name="areaId"
                    />
                </div>

                <div className="p-col-12 p-md-6">
                    <label htmlFor="maxQuantity">Max Quantity</label>
                    <InputText
                        id="maxQuantity"
                        name="maxQuantity"
                        value={updatedCage.maxQuantity}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="p-col-12 p-md-6">
                    <label htmlFor="description">Description</label>
                    <InputTextarea
                        id="description"
                        name="description"
                        rows={3}
                        value={updatedCage.description}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="p-col-12 p-d-flex p-jc-end">
                    <Button
                        label="Submit"
                        icon="pi pi-check"
                        className="p-button-success"
                        onClick={handleUpdateCage}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default ModalUpdateCage;
