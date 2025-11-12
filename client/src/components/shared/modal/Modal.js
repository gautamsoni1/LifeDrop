import React, { useState , useEffect } from "react";
// import { useSelector } from "react-redux";
import InputType from "./../Form/InputType";
import API from "./../../../services/API";

const Modal = ({ selectedOrg }) => {
  const [inventoryType, setInventoryType] = useState("in");
  const [bloodGroup, setBloodGroup] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (selectedOrg) {
      setInventoryType("in");
      setBloodGroup("");
      setQuantity(0);
      setEmail("");
    }
  }, [selectedOrg]);

  const handleModalSubmit = async () => {
    try {
      if (!bloodGroup || !quantity || !email) {
        return alert("Please fill all fields");
      }

      const { data } = await API.post("/inventory/create-inventory", {
        email,
        organisation: selectedOrg?._id,
        inventoryType,
        bloodGroup,
        quantity,
      });

      if (data?.success) {
        alert("✅ New Record Created");
        window.location.reload();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="modal fade" id="staticBackdrop">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h1 className="modal-title fs-5">Manage Blood Record</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>

          {/* BODY */}
          <div className="modal-body">
            {selectedOrg && (
              <p><b>Organisation:</b> {selectedOrg.organisationName || selectedOrg.name}</p>
            )}

            {/* Radio */}
            <div className="d-flex mb-3">
              Type:&nbsp;
              <div className="form-check ms-3">
                <input type="radio" value="in" checked={inventoryType==="in"}
                  onChange={(e) => setInventoryType(e.target.value)} className="form-check-input" />
                <label className="form-check-label">IN</label>
              </div>
              <div className="form-check ms-3">
                <input type="radio" value="out" checked={inventoryType==="out"}
                  onChange={(e) => setInventoryType(e.target.value)} className="form-check-input" />
                <label className="form-check-label">OUT</label>
              </div>
            </div>

            {/* Blood group */}
            <select className="form-select mb-3" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">Select Blood Group</option>
              {["O+","O-","AB+","AB-","A+","A-","B+","B-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            {/* Email */}
            <InputType labelText={inventoryType==="in" ? "Donor Email" : "Hospital Email"}
              inputType="email" value={email} onChange={(e)=>setEmail(e.target.value)} />

            {/* Quantity */}
            <InputType labelText="Quantity (ML)" inputType="number"
              value={quantity} onChange={(e)=>setQuantity(e.target.value)} />
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" className="btn btn-primary" onClick={handleModalSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
