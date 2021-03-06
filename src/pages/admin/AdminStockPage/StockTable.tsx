import React, { useState, DetailedHTMLProps, HTMLAttributes } from 'react';
import {
  Table,
  Input,
  Popconfirm,
  Form,
  Button,
  Select,
  Modal,
  message,
  Icon,
  Tooltip,
} from 'antd';
import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form/Form';

import {
  Configuration,
  AGRADE,
  NEW,
  Condition,
  useStock,
} from '../../../modules/stock';
import Uploader from '../../../components/Uploader';
import { ButtonList, RoundedButton } from '../../../utils';

const EditableContext = React.createContext<WrappedFormUtils | null>(null);

type HtmlElementProps<T> = DetailedHTMLProps<HTMLAttributes<T>, T>;

const EditableRow = ({
  form,
  ...props
}: FormComponentProps & HtmlElementProps<HTMLTableRowElement>) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

type EditableTableProps = HtmlElementProps<HTMLTableCellElement> & {
  editable: boolean;
  dataIndex: keyof KeyedConfiguration;
  title: () => string;
  record: KeyedConfiguration;
  index: number;
  handleSave: (record: KeyedConfiguration) => void;
  children: React.ReactNode;
};

class EditableCell extends React.Component<EditableTableProps> {
  state = {
    editing: false,
    inputRef: React.createRef<Input>(),
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing && this.state.inputRef.current) {
        this.state.inputRef.current.focus();
      }
    });
  };

  save = (
    form: WrappedFormUtils,
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const { record, handleSave } = this.props;
    form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({
        ...record,
        price: values.price ? +values.price : record.price,
        cost: values.cost ? +values.cost : record.cost,
        stock: values.stock ? +values.stock : record.stock,
      });
    });
  };

  renderCell = (form: WrappedFormUtils | null) => {
    if (form === null) {
      return;
    }
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <Input
            ref={this.state.inputRef}
            onPressEnter={e => this.save(form, e)}
            onBlur={e => this.save(form, e)}
          />,
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const { editable, children, ...restProps } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

type AddFormModalProps = {
  handleClose: () => void;
  handleAdd: (newConfiguration: Configuration) => void;
  visible: boolean;
};

const AddFormModal: React.FC<AddFormModalProps> = ({
  handleClose,
  handleAdd,
  visible,
}) => {
  const [condition, setCondition] = useState<Condition>(AGRADE);
  const [color, setColor] = useState('');
  const [memory, setMemory] = useState('64');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');

  const onSubmit = (
    e:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    handleAdd({
      condition,
      color: color,
      memory: +memory,
      price: +price,
      cost: +cost,
      stock: +stock,
    });
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      title="Create a new configuration"
      okText="Create"
      onCancel={handleClose}
      onOk={onSubmit}
    >
      <Form onSubmit={onSubmit}>
        <Form.Item label="Condition">
          <Select
            value={condition}
            onChange={(newCondition: Condition) => setCondition(newCondition)}
          >
            <Select.Option value={AGRADE}>A-Grade</Select.Option>
            <Select.Option value={NEW}>New</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Color">
          <Input
            type="text"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Memory">
          <Input
            type="number"
            value={memory}
            onChange={e => setMemory(e.target.value)}
            addonAfter=" GB"
          />
        </Form.Item>
        <Form.Item label="Price">
          <Input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            addonBefore="$ "
          />
        </Form.Item>
        <Form.Item label="Cost">
          <Input
            type="number"
            value={cost}
            onChange={e => setCost(e.target.value)}
            addonBefore="$ "
          />
        </Form.Item>
        <Form.Item label="Stock">
          <Input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

type KeyedConfiguration = Configuration & {
  key: string;
};

type Props = {
  model: string;
  id: string;
  datasource: KeyedConfiguration[];
  imageUrls: string[];
};

const StockTable: React.FC<Props> = ({
  datasource: initialDataSource,
  model,
  id,
  imageUrls,
}) => {
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [newStockImageUrls, setNewStockImageUrls] = useState<string[]>([]);
  const { updateModel, deleteModel } = useStock();

  const addImages = (
    e:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    updateModel(id, {
      imageUrls: [...imageUrls, ...newStockImageUrls],
    });
    setNewStockImageUrls([]);
    setShowAddImagesModal(false);
  };

  const handleDelete = async (key: string) => {
    const newData = dataSource.filter(item => item.key !== key);
    setDataSource(newData);
    await updateModel(id, { model, configurations: newData });
  };

  const handleAdd = async (newConfig: Configuration) => {
    const newData = {
      key: `${newConfig.condition}-${newConfig.color}-${newConfig.memory}`,
      ...newConfig,
    };
    if (dataSource.find(config => config.key === newData.key)) {
      return message.error(
        'Configuration with matching condition and memory already exists',
      );
    }
    const newDataSource = [...dataSource, newData];
    setDataSource(newDataSource);
    await updateModel(id, {
      model,
      configurations: newDataSource,
    });
  };

  const handleSave = async (row: KeyedConfiguration) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    await updateModel(id, { model, configurations: newData });
  };

  const components = {
    body: {
      row: EditableFormRow,
      cell: EditableCell,
    },
  };

  const stockColumns = [
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      editable: true,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      editable: true,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      // eslint-disable-next-line react/display-name
      render: (_: string, record: KeyedConfiguration) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button type="link" style={{ padding: 0 }}>
              Delete
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const columns = stockColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: KeyedConfiguration) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <Table
        title={() => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{model}</span>
            <Tooltip title="Click to delete model" placement="left">
              <Icon type="delete" onClick={async () => await deleteModel(id)} />
            </Tooltip>
          </div>
        )}
        footer={() => (
          <ButtonList>
            <RoundedButton onClick={() => setShowAddModal(true)} type="primary">
              Add new configuration
            </RoundedButton>
            <RoundedButton
              onClick={() => setShowAddImagesModal(true)}
              type="default"
            >
              Add new images
            </RoundedButton>
          </ButtonList>
        )}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
      <AddFormModal
        handleClose={() => setShowAddModal(false)}
        handleAdd={handleAdd}
        visible={showAddModal}
      />
      <Modal
        visible={showAddImagesModal}
        title="Add images"
        okText="Add"
        onCancel={() => setShowAddImagesModal(false)}
        onOk={addImages}
      >
        <div>
          {imageUrls.map(imageUrl => (
            <img
              key={imageUrl}
              style={{ width: '100%' }}
              src={imageUrl}
              alt={`${model} stock images`}
            />
          ))}
        </div>
        <Uploader
          storagePath={`stock-images/${model}`}
          accept="image/*"
          onUploadComplete={urls => setNewStockImageUrls(urls)}
        />
      </Modal>
    </div>
  );
};

export default StockTable;
