// Customize Dynamic Form

import React, { useState, useRef } from "react";
import formSchem from "./formSchema.json"; // Import the JSON schema
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Menu } from "@headlessui/react"; // For dropdown functionality
import { DotsVerticalIcon } from "@heroicons/react/outline"; // Heroicons for the three dots icon

const ResponsiveGridLayout = WidthProvider(Responsive);
const arraysEqual = (arr1, arr2) => {
	return JSON.stringify(arr1) === JSON.stringify(arr2);
};
const App = () => {
	const [formData, setFormData] = useState(
		formSchem?.schema.reduce((acc, field) => {
			acc[field.name] = field.type === "checkbox" ? false : "";
			return acc;
		}, {})
	);

	const [error, setError] = useState({});
	const [editMode, setEditMode] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [currentField, setCurrentField] = useState({});
	const [currentOptions, setCurrentOptions] = useState("");

	const [records, setRecords] = useState([]);
	// const [schema, setSchema] = useState(Safety); // Dynamic form schema
	const [layoutJson, setLayoutsJson] = useState({});
	const [schema, setSchema] = useState(() => {
		const savedSchema = localStorage.getItem("Safety");
		return savedSchema ? JSON.parse(savedSchema) : formSchem.schema;
	});
	console.log("layoutJson", layoutJson);
	const [newField, setNewField] = useState({
		name: "",
		type: "text",
		placeholder: "",
		required: false,
		options: [],
	});
	const [showModal, setShowModal] = useState(false); // State to control modal visibility
	const [newOptions, setNewOptions] = useState(""); // Temporary state for options input

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
	};

	const generateLayouts = () =>
		schema.map((field, index) => ({
			i: field.name, // Unique ID for each field
			x: (index % 2) * 6, // Alternates between 0 and 6 for two fields per row
			y: Math.floor(index / 2), // Creates a new row every 2 fields
			w: 6, // Each field spans half of the row (6 columns out of 12)
			h: 1.5, // Fixed height for each field
		}));

	const [layouts, setLayouts] = useState(() => {
		// Load layout from local storage or generate a new one
		const savedLayout = localStorage.getItem(`grid-layout-${schema[0]?.name}`);
		return savedLayout ? JSON.parse(savedLayout) : generateLayouts();
		// formSchem.layoutJson;
	});

	const currentLayout = useRef(layouts);

	const handleLayoutChange = (layout, allLayouts) => {
		if (!arraysEqual(layout, currentLayout.current)) {
			currentLayout.current = layout;
			setLayouts(allLayouts);
			setLayoutsJson(allLayouts);
			// Save the updated layout to local storage
			localStorage.setItem(
				`grid-layout-${schema[0]?.name}`,
				JSON.stringify(allLayouts)
			);
		}
	};

	const validate = () => {
		let errors = {};
		schema.forEach((field) => {
			if (field.required && !formData[field.name]) {
				errors[field.name] = `${field.name} is required.`;
			}
		});
		return errors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const formErrors = validate();
		if (Object.keys(formErrors).length > 0) {
			setError(formErrors);
			return;
		}
		setError({});
		setRecords([...records, formData]);
		setFormData(
			schema.reduce((acc, field) => {
				acc[field.name] = field.type === "checkbox" ? false : "";
				return acc;
			}, {})
		);
		alert("Form submitted!");
	};

	const handleNewFieldChange = (e) => {
		const { name, value } = e.target;
		setNewField({ ...newField, [name]: value });
	};

	const handleOptionsChange = (e) => {
		setNewOptions(e.target.value);
	};

	const addNewField = () => {
		if (!newField.name) {
			alert("Field Name is required.");
			return;
		}

		const fieldToAdd = {
			...newField,
			options:
				newField.type === "select" || newField.type === "radio"
					? newOptions.split(",").map((opt) => opt.trim())
					: [],
		};

		const updatedSchema = [...schema, fieldToAdd];
		setSchema(updatedSchema);

		// Save the updated schema to local storage
		localStorage.setItem("Safety", JSON.stringify(updatedSchema));

		setFormData({
			...formData,
			[newField.name]: newField.type === "checkbox" ? false : "",
		});

		setNewField({
			name: "",
			type: "text",
			placeholder: "",
			required: false,
			options: [],
		});
		setNewOptions(""); // Clear options input
		setShowModal(false); // Close the modal after adding the field
	};
	// Add handlers for edit and delete
	const updateField = () => {
		// Update the schema in state and localStorage
		const updatedSchema = schema.map((f) =>
			f.name === currentField.originalName
				? {
						...currentField, // Use the updated currentField values
						name: currentField.name, // Ensure the name is updated
						options:
							currentField.type === "select" || currentField.type === "radio"
								? currentOptions.split(",") // Handle options if needed
								: undefined,
					}
				: f
		);

		setSchema(updatedSchema);
		localStorage.setItem("Safety", JSON.stringify(updatedSchema));
		setShowEditModal(false); // Close the modal after updating
	};

	// Function to handle the editing process
	const handleEditField = (field) => {
		setCurrentField({ ...field, originalName: field.name }); // Set original name for reference
		setCurrentOptions(field.options ? field.options.join(", ") : ""); // Prepare options for editing
		setShowEditModal(true);
	};

	// Function to delete a field and update localStorage
	const handleDeleteField = (fieldName) => {
		if (window.confirm("Are you sure you want to delete this field?")) {
			const updatedSchema = schema.filter((field) => field.name !== fieldName);
			setSchema(updatedSchema);
			localStorage.setItem("Safety", JSON.stringify(updatedSchema));
		}
	};
	const handleCheckboxChange = (e, name) => {
		const { value, checked } = e.target;
		setFormData((prev) => {
			const currentValues = prev[name] || [];
			if (checked) {
				return { ...prev, [name]: [...currentValues, value] };
			} else {
				return {
					...prev,
					[name]: currentValues.filter((val) => val !== value),
				};
			}
		});
	};
	const handleExport = () => {
		// Combine both objects into one
		const combinedData = {
			schema,
			layoutJson,
		};

		const jsonString = JSON.stringify(combinedData, null, 2); // Pretty format JSON
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "combinedSchemas.json"; // File name
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	console.log("LAYOUT", layouts);
	console.log("JSON Layout", formSchem.layouts);
	return (
		<div className="flex items-center justify-center bg-gray-100 p-4 w-full">
			<div className="w-full p-8 bg-white rounded-lg shadow-lg">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-700">
						Dynamic Form v-2.0
					</h2>
					<div>
						<div className="flex">
							<span className="w-max justify-center content-center mr-5">
								{" "}
								{editMode ? "Disable" : "Enable"} Edit Mode
							</span>
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									// defaultChecked={true}
									onChange={() => setEditMode((editMode) => !editMode)}
								/>
								<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
							</label>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className="p-2 bg-success text-white rounded-md"
						>
							Add Field
						</button>
						<button
							onClick={handleExport}
							className="p-2 bg-success text-white rounded-md ml-4"
						>
							Export Form
						</button>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid gap-6">
						<ResponsiveGridLayout
							className="layout"
							layouts={layouts}
							breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
							cols={{ lg: 16, md: 12, sm: 8, xs: 4, xxs: 1 }} // Adjust the columns per breakpoint
							rowHeight={50}
							onLayoutChange={handleLayoutChange}
							isResizable={editMode}
							isDraggable={editMode}
						>
							{schema?.map((field) => (
								<div
									key={field.name}
									className="relative p-2 bg-white shadow-md rounded-md"
								>
									<div className="flex justify-between items-center">
										<label
											htmlFor={field.name}
											className="block text-gray-700 capitalize font-medium"
										>
											{field.name}
										</label>
										{editMode && (
											<Menu
												as="div"
												className="relative inline mr-[-18px] z-12"
											>
												<Menu.Button className="focus:outline-none">
													<DotsVerticalIcon className="w-5 h-5 text-gray-500" />
												</Menu.Button>
												<Menu.Items className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
													<Menu.Item>
														{({ active }) => (
															<button
																className={`${
																	active ? "bg-gray-100" : ""
																} w-full text-left px-4 py-2 text-sm text-gray-700`}
																onClick={() => handleEditField(field)}
															>
																Edit
															</button>
														)}
													</Menu.Item>
													<Menu.Item>
														{({ active }) => (
															<button
																className={`${
																	active ? "bg-gray-100" : ""
																} w-full text-left px-4 py-2 text-sm text-red-500`}
																onClick={() => handleDeleteField(field.name)}
															>
																Delete
															</button>
														)}
													</Menu.Item>
												</Menu.Items>
											</Menu>
										)}
									</div>

									{field.type === "radio" ? (
										<div className="mt-1">
											{field.options.map((option) => (
												<label key={option.value} className="block">
													<input
														type="radio"
														name={field.name}
														value={option.value}
														checked={formData[field.name] === option.value}
														onChange={handleChange}
														className="mr-2"
													/>
													{option.label}
												</label>
											))}
										</div>
									) : field.type === "checkbox" ? (
										<div className="mt-1">
											{field.options.map((option) => (
												<label key={option.value} className="block">
													<input
														type="checkbox"
														name={field.name}
														value={option.value}
														checked={
															Array.isArray(formData[field.name]) &&
															formData[field.name].includes(option.value)
														}
														onChange={(e) =>
															handleCheckboxChange(e, field.name)
														}
														className="mr-2"
													/>
													{option.label}
												</label>
											))}
										</div>
									) : field.type === "select" ? (
										<select
											id={field.name}
											name={field.name}
											value={formData[field.name]}
											onChange={handleChange}
											className="w-full p-2 border border-gray-300 rounded-md"
										>
											<option value="">Select {field.name}</option>
											{field.options.map((option, idx) => (
												<option key={idx} value={option}>
													{option}
												</option>
											))}
										</select>
									) : (
										<input
											type={field.type}
											id={field.name}
											name={field.name}
											value={formData[field.name]}
											onChange={handleChange}
											className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
											placeholder={field.placeholder || `Enter ${field.name}`}
										/>
									)}
									{error[field.name] && (
										<p className="text-red-500 text-sm mt-2">
											{error[field.name]}
										</p>
									)}
								</div>
							))}

							{/* Edit Modal */}
						</ResponsiveGridLayout>
					</div>

					<button
						type="submit"
						className="w-full py-2 bg-primary text-white rounded-md hover:bg-info focus:outline-none focus:ring-2 focus:ring-primary"
					>
						Submit Form
					</button>
				</form>

				{showEditModal && (
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
						<div className="bg-white p-6 rounded-md shadow-lg">
							<h3 className="text-lg font-semibold mb-4">Edit Field</h3>
							<div className="grid grid-cols-1 gap-4">
								<input
									type="text"
									name="name"
									value={currentField.name}
									onChange={(e) =>
										setCurrentField({
											...currentField,
											name: e.target.value,
										})
									}
									placeholder="Field Name"
									className="p-2 border border-gray-300 rounded-md"
								/>
								<select
									name="type"
									value={currentField.type}
									onChange={(e) =>
										setCurrentField({
											...currentField,
											type: e.target.value,
										})
									}
									className="p-2 border border-gray-300 rounded-md"
								>
									<option value="text">Text</option>
									<option value="text">Number</option>
									<option value="email">Email</option>
									<option value="tel">Phone</option>
									<option value="date">Date</option>
									<option value="select">Select</option>
									{/* <option value="radio">Radio</option> */}
									{/* <option value="checkbox">Checkbox</option> */}
									<option value="file">File</option>
								</select>
								{(currentField.type === "select" ||
									currentField.type === "radio") && (
									<input
										type="text"
										value={currentOptions}
										onChange={(e) => setCurrentOptions(e.target.value)}
										placeholder="Options (comma-separated)"
										className="p-2 border border-gray-300 rounded-md"
									/>
								)}
								<label className="flex items-center">
									<input
										type="checkbox"
										name="required"
										checked={currentField.required}
										onChange={(e) =>
											setCurrentField({
												...currentField,
												required: e.target.checked,
											})
										}
										className="mr-2"
									/>
									Required
								</label>
							</div>
							<div className="mt-4 flex justify-end space-x-4">
								<button
									onClick={() => setShowEditModal(false)}
									className="p-2 bg-gray-400 text-white rounded-md"
								>
									Cancel
								</button>
								<button
									onClick={updateField}
									className="p-2 bg-primary text-white rounded-md"
								>
									Update Field
								</button>
							</div>
						</div>
					</div>
				)}
				{/* Add New Field Modal */}
				{showModal && (
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
						<div className="bg-white p-6 rounded-md shadow-lg">
							<h3 className="text-lg font-semibold mb-4">Add New Field</h3>
							<div className="grid grid-cols-1 gap-4">
								<input
									type="text"
									name="name"
									value={newField.name}
									onChange={handleNewFieldChange}
									placeholder="Field Name"
									className="p-2 border border-gray-300 rounded-md"
								/>
								<select
									name="type"
									value={newField.type}
									onChange={handleNewFieldChange}
									className="p-2 border border-gray-300 rounded-md"
								>
									<option value="text">Text</option>
									<option value="number">Number</option>
									<option value="email">Email</option>
									<option value="tel">Phone</option>
									<option value="date">Date</option>
									<option value="select">Select</option>
									{/* <option value="radio">Radio</option> */}
									{/* <option value="checkbox">Checkbox</option> */}
									<option value="file">File</option>
								</select>
								{(newField.type === "select" || newField.type === "radio") && (
									<input
										type="text"
										value={newOptions}
										onChange={handleOptionsChange}
										placeholder="Options (comma-separated)"
										className="p-2 border border-gray-300 rounded-md"
									/>
								)}
								<label className="flex items-center">
									<input
										type="checkbox"
										name="required"
										checked={newField.required}
										onChange={(e) =>
											setNewField({ ...newField, required: e.target.checked })
										}
										className="mr-2"
									/>
									Required
								</label>
							</div>
							<div className="mt-4 flex justify-end space-x-4">
								<button
									onClick={() => setShowModal(false)}
									className="p-2 bg-gray-400 text-white rounded-md"
								>
									Cancel
								</button>
								<button
									onClick={addNewField}
									className="p-2 bg-primary text-white rounded-md"
								>
									Add Field
								</button>
							</div>
						</div>
					</div>
				)}
				{records.length > 0 && (
					<div className="mt-6 overflow-x-auto">
						<h3 className="text-xl font-semibold mb-4 text-gray-700">
							Submitted Records
						</h3>
						<table className="w-full border-collapse border border-gray-300">
							<thead>
								<tr className="bg-gray-200">
									{schema.map((field) => (
										<th
											key={field.name}
											className="p-2 border border-gray-300 text-left text-gray-700"
										>
											{field.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{records.map((record, index) => (
									<tr key={index} className="border-b">
										{schema.map((field) => (
											<td
												key={field.name}
												className="p-2 border border-gray-300 text-gray-600"
											>
												{record[field.name]}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
