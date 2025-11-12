import React, { useCallback, useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { useSelector } from "react-redux";

const Consumer = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);

  const getDonars = useCallback(async () => {
    try {
      const { data } = await API.post("/inventory/get-inventory-hospital", {
        filters: {
          inventoryType: "out",
          hospital: user?._id,
        },
      });
      if (data?.success) {
        setData(data?.inventory);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user?._id]);

  useEffect(() => {
    getDonars();
  }, [getDonars]);

  return (
    <Layout>
      <div className="container mt-4">
        <h2>Consumed Blood Records</h2>
        <table className="table table-bordered table-striped mt-3">
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Inventory Type</th>
              <th>Quantity</th>
              <th>Email Info</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((record) => (
              <tr key={record._id}>
                <td>{record.bloodGroup}</td>
                <td>{record.inventoryType}</td>
                <td>{record.quantity} ml</td>
                <td>
                  <div><strong>Hospital:</strong> {record?.hospital?.email || record.email}</div>
                  {record?.donar?.email && (
                    <div><strong>Donor:</strong> {record.donar.email}</div>
                  )}
                  {record?.organisation?.email && (
                    <div><strong>Organisation:</strong> {record.organisation.email}</div>
                  )}
                </td>
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Consumer;
