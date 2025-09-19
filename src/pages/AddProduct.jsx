import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Form, Input, Select, InputNumber, Button, Card, Typography, Space, message, Row, Col, Divider } from 'antd';
import UploadHelper from '../Helper/UploadHelper';
import ShowImages from '../Helper/ShowImages';
import { addProduct } from '../Helper/apiHelper';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [image_path, setImagePath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sku, setSku] = useState('');

  const categories = [
    'Electronics',
    'Accessories',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive'
  ];

  const divisions = [
    'North',
    'South',
    'East',
    'West',
    'Central'
  ];

  // Generate SKU when component mounts
  useEffect(() => {
    generateSKU();
  }, []);

  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newSku = `SKU-${timestamp}-${randomStr}`;
    setSku(newSku);
    return newSku;
  };

   const handleSave = async (isDraft = false) => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare image data - extract just URLs
      const imageUrls = Array.isArray(image_path) 
        ? image_path.map(img => img.path) 
        : [image_path].filter(Boolean);

      const productData = {
        name: values.productName,
        category: values.category,
        sellerPrice: values.sellerPrice,
        quantity: values.quantity,
        description: values.description,
        division: values.division,
        sku: sku,
        Product_image: imageUrls,
        status: isDraft ? 'draft' : 'active'
      };

      const response = await addProduct(productData);

      message.success(`Product ${isDraft ? 'saved as draft' : 'saved'} successfully!`);
      setLoading(false);
      navigate('/inventory');
      
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill all required fields correctly');
      } else {
        message.error(error.response?.data?.message || 'Failed to add product');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <Space>
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/inventory')}
              className="flex items-center"
            >
              Back to Inventory
            </Button>
          </Space>
          <Title level={2} className="mt-4">Add New Product</Title>
          <Text type="secondary">Fill in the details below to add a new product to your inventory</Text>
        </Card>

        <Row gutter={24}>
          {/* Left Column - Product Details */}
          <Col xs={24} lg={14}>
            <Card title="Product Information" className="mb-6">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  productName: '',
                  category: undefined,
                  sellerPrice: undefined,
                  quantity: undefined,
                  description: '',
                  division: undefined
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="productName"
                      label="Product Name"
                      rules={[{ required: true, message: 'Product name is required' }]}
                    >
                      <Input placeholder="Enter product name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="SKU">
                      <Input 
                        value={sku} 
                        disabled 
                        size="large"
                        suffix={
                          <Button 
                            type="link" 
                            onClick={generateSKU}
                            size="small"
                          >
                            Regenerate
                          </Button>
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: 'Category is required' }]}
                    >
                      <Select placeholder="Select a category" size="large">
                        {categories.map(category => (
                          <Option key={category} value={category}>{category}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="division"
                      label="Division"
                      rules={[{ required: true, message: 'Division is required' }]}
                    >
                      <Select placeholder="Select a division" size="large">
                        {divisions.map(division => (
                          <Option key={division} value={division}>{division}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="sellerPrice"
                      label="Seller Price (₹)"
                      rules={[
                        { required: true, message: 'Seller price is required' },
                        { type: 'number', min: 0, message: 'Price must be positive' }
                      ]}
                    >
                      <InputNumber
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[
                        { required: true, message: 'Quantity is required' },
                        { type: 'number', min: 0, message: 'Quantity must be positive' }
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter quantity"
                        min={0}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Description is required' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter product description"
                    size="large"
                  />
                </Form.Item>

                <Form.Item 
                  name="product_images" 
                  label={<span>Product Images <span className="text-red-500">*</span></span>}
                  rules={[{ required: image_path.length === 0, message: 'At least one image is required' }]}
                >
                  <div className="flex flex-col gap-4">
                    {image_path.length > 0 ? (
                      <ShowImages path={image_path} setImage={setImagePath} multiple={true} />
                    ) : null}
                    
                    {image_path.length < 5 && (
                      <UploadHelper 
                        setImagePath={setImagePath} 
                        image_path={image_path} 
                        multiple={true} 
                        max={5} 
                      />
                    )}
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Right Column - Actions */}
          <Col xs={24} lg={10}>
            <Card title="Actions">
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={() => handleSave(false)}
                  className="w-full"
                >
                  Save Product
                </Button>
                
                <Button
                  size="large"
                  loading={loading}
                  onClick={() => handleSave(true)}
                  className="w-full"
                >
                  Save as Draft
                </Button>
              </Space>
              
              <Divider />
              
              <Text type="secondary" className="text-xs">
                Required fields are marked with an asterisk (*)
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddProduct;