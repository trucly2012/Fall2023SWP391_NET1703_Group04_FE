import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '/node_modules/primeflex/primeflex.css';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { useNavigate } from 'react-router-dom';
import ModalUpdateCage from './ModalUpdateCage';

const ManageCage = () => {
    const navigate = useNavigate();
    const [cages, setCages] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [newCage, setNewCage] = useState({
        animalCageName: '',
        description: '',
        maxQuantity: '',
        areaId: null
    });
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [data, setData] = useState({});
    const [confirmationDialog, setConfirmationDialog] = useState({
        visible: false,
        action: null,
        message: '',
        params: null
    });
    const toast = useRef(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        animalName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cageResponse, areaResponse] = await Promise.all([
                    axios.get('http://localhost:8081/api/v1/animalCage/getAllAnimalCage'),
                    axios.get('http://localhost:8081/api/v1/area/all')
                ]);
                setCages(cageResponse.data.catalogueDTO);
                setAreas(areaResponse.data.area); // Adjust if needed based on actual response structure
            } catch (error) {
                console.error("Fetch data error:", error);
            }
        };

        fetchData();
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            animalName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        });
        setGlobalFilterValue('');
    };

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prevFilters => ({
            ...prevFilters,
            global: { value }
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => (
        <div className="flex justify-content-between align-items-center">
            <Button
                label="Add"
                icon="pi pi-plus"
                className="p-button-primary"
                onClick={() => setDisplayDialog(true)}
            />
            <Button className='ml-auto' type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search by name" />
            </span>
        </div>
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewCage(prevCage => ({
            ...prevCage,
            [name]: value
        }));
    };

    const handleSelectedChange = (event) => {
        const selectedArea = event.value;
        setSelectedArea(selectedArea);
        setNewCage(prevCage => ({
            ...prevCage,
            areaId: selectedArea?.areaId || null
        }));
    };

    const handleAddCage = async () => {
        try {
            const response = await axios.post('http://localhost:8081/api/v1/animalCage/createNewAnimalCage', newCage);
            show(response.data.message, 'green');
            setDisplayDialog(false);
            setNewCage({
                animalCageName: '',
                description: '',
                maxQuantity: '',
                areaId: null
            });
        } catch (error) {
            console.error("Add cage error:", error);
        }
    };

    const handleDeleteCage = (cageId) => {
        setConfirmationDialog({
            visible: true,
            action: () => deleteCage(cageId),
            message: 'Are you sure you want to delete this cage?'
        });
    };

    const deleteCage = async (cageId) => {
        try {
            const response = await axios.delete(`http://localhost:8081/api/v1/animalCage/deleteAnimalCage/${cageId}`);
            show(response.data.message, 'green');
        } catch (error) {
            console.error("Delete cage error:", error);
        }
    };

    const show = (message, color) => {
        toast.current.show({
            summary: 'Notification',
            detail: message,
            life: 3000,
            style: { backgroundColor: color, color: 'white' },
        });
    };

    const handleClose = () => {
        setIsUpdateModalOpen(false);
    };

    const openUpdateModal = (cage) => {
        setData(cage);
        setIsUpdateModalOpen(true);
    };

    const header = renderHeader();

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" onClick={() => setDisplayDialog(true)} icon="pi pi-plus" text label='Add' />;

    return (
        <div className="p-d-flex p-jc-center p-ai-center" style={{ width: "100%", padding: '20px' }}>
            <Toast ref={toast} />
            {isUpdateModalOpen && <ModalUpdateCage data={data} isModalOpen={isUpdateModalOpen} handleClose={handleClose} />}
            <div style={{ width: "90%", maxWidth: '1200px' }}>
                <h1 className="p-text-center mb-4">Cage Management</h1>
                <DataTable
                    value={cages}
                    stripedRows
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    header={header}
                    tableStyle={{ minWidth: '50rem' }}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    paginatorLeft={paginatorLeft}
                    paginatorRight={paginatorRight}
                    filters={filters}
                >
                    <Column field="animalCageName" header="Cage Name" />
                    <Column field="areaName" header="Area" />
                    <Column field="description" header="Description" />
                    <Column field="maxQuantity" header="Max Quantity" />
                    <Column
                        style={{ width: '15%' }}
                        header="Actions"
                        body={(rowData) => (
                            <div className="p-d-flex p-ai-center">
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-mr-2"
                                    onClick={() => handleDeleteCage(rowData.animalCageId)}
                                />
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-info"
                                    onClick={() => openUpdateModal(rowData)}
                                />
                            </div>
                        )}
                    />
                </DataTable>
            </div>

            {/* Add Cage Dialog */}
            <Dialog
                header="Add Cage"
                visible={displayDialog}
                style={{ width: '80%' }}
                modal
                onHide={() => setDisplayDialog(false)}
                className="p-fluid"
            >
                <div className="p-grid p-fluid">
                    <div className="p-col-12 p-md-6">
                        <label htmlFor="animalCageName">Cage Name</label>
                        <InputText
                            id="animalCageName"
                            name="animalCageName"
                            value={newCage.animalCageName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="p-col-12 p-md-6">
                        <label htmlFor="areaId">Area</label>
                        <Dropdown
                            value={selectedArea}
                            onChange={handleSelectedChange}
                            options={areas}
                            optionLabel="areaName"
                            placeholder="Select an Area"
                        />
                    </div>

                    <div className="p-col-12 p-md-6">
                        <label htmlFor="maxQuantity">Max Quantity</label>
                        <InputText
                            id="maxQuantity"
                            name="maxQuantity"
                            value={newCage.maxQuantity}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="p-col-12 p-md-6">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            name="description"
                            rows={3}
                            value={newCage.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="p-col-12 p-d-flex p-jc-end">
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={handleAddCage}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                header="Confirmation"
                visible={confirmationDialog.visible}
                style={{ width: '400px' }}
                modal
                footer={
                    <div className="p-d-flex p-jc-between">
                        <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setConfirmationDialog({ ...confirmationDialog, visible: false })} />
                        <Button
                            label="Yes"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={() => {
                                confirmationDialog.action();
                                setConfirmationDialog({ ...confirmationDialog, visible: false });
                            }}
                        />
                    </div>
                }
                onHide={() => setConfirmationDialog({ ...confirmationDialog, visible: false })}
            >
                <p>{confirmationDialog.message}</p>
            </Dialog>
        </div>
    );
};

export default ManageCage;
