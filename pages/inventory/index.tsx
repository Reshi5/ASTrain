import React, { useContext, useEffect, useState } from "react";
import PageTitle from "../../components/common/pageTitle/PageTitle";
import { FetchContext } from "@context/FetchContext";
import { formatCurrency } from "../../utils";

import DangerButton from "../../components/common/dangerButton/DangerButton";
import FormError from "../../components/formError/FormError";
import FormSuccess from "../../components/formSuccess/FormSuccess";
import { AxiosError } from "axios";
import { IItem } from "@interfaces/IItem";
import { MainLayout } from "../../layouts";
import { InventoryItemForm } from "../../components";
import {
  IInventoryItemForm,
  TInventoryItemInitialValues,
} from "@interfaces/IInventoryItemForm";

const InventoryItemContainer: React.FC = ({ children }) => (
  <div className="bg-white rounded shadow-md mb-4 p-4">{children}</div>
);

interface IInventoryItem {
  item: IItem;
  onDelete: (arg: IItem) => void;
}

const InventoryItem: React.FC<IInventoryItem> = ({ item, onDelete }) => {
  return (
    <div className="flex">
      <img className="rounded w-32 h-full" src={item.image} alt="inventory" />
      <div className="flex justify-between w-full">
        <div className="flex flex-col ml-4 justify-between">
          <div>
            <p className="font-bold text-xl text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">{item.itemNumber}</p>
          </div>
          <div>
            <p className="text-gray-700 text-xl">
              {formatCurrency(item.unitPrice)}
            </p>
          </div>
        </div>
        <div className="self-end">
          <DangerButton text="Delete" onClick={() => onDelete(item)} />
        </div>
      </div>
    </div>
  );
};

const NewInventoryItem: React.FC<IInventoryItemForm> = ({ onSubmit }) => {
  return (
    <section className="bg-white p-4 shadow-md rounded-md">
      <p className="font-bold mb-2">New Inventory Item</p>
      <InventoryItemForm onSubmit={onSubmit} />
    </section>
  );
};

const Inventory: React.FC = () => {
  const fetchContext = useContext(FetchContext);
  const [inventory, setInventory] = useState<IItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const getInventory = async () => {
      try {
        return await fetchContext.authAxios.get("inventory");
      } catch (err) {
        console.log("the err", err);
      }
    };

    getInventory().then((response) => {
      if (response?.status === 200) {
        setInventory(response.data);
      } else {
        console.log(response?.data.message);
      }
    });
  }, [fetchContext]);

  const onSubmit = async (
    values: TInventoryItemInitialValues,
    resetForm: () => void
  ) => {
    try {
      const { data } = await fetchContext.authAxios.post("inventory", values);
      setInventory([...inventory, data.inventoryItem]);
      resetForm();
      setSuccessMessage(data.message);
      setErrorMessage("");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        const error = err as AxiosError;
        setErrorMessage(error?.response?.data.message || "Unexpected error");
      }
      setSuccessMessage("");
    }
  };

  const onDelete = async (item: IItem) => {
    try {
      if (window.confirm("Are you sure you want to delete this item?")) {
        const { data } = await fetchContext.authAxios.delete(
          `inventory/${item._id}`
        );
        setInventory(
          inventory.filter((item: IItem) => item._id !== data.deletedItem._id)
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        const error = err as AxiosError;
        setErrorMessage(error?.response?.data.message || "Unexpected error");
      }
    }
  };

  return (
    <MainLayout>
      <PageTitle title="Inventory" />
      {successMessage && <FormSuccess text={successMessage} />}
      {errorMessage && <FormError text={errorMessage} />}
      <div className="mb-4">
        <NewInventoryItem onSubmit={onSubmit} />
      </div>
      {inventory && inventory.length
        ? inventory.map((item: IItem) => (
            <InventoryItemContainer key={item._id}>
              <InventoryItem item={item} onDelete={onDelete} />
            </InventoryItemContainer>
          ))
        : "No Inventory Items"}
    </MainLayout>
  );
};

export default Inventory;
