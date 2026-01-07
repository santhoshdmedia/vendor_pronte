import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Lock, Unlock } from 'lucide-react';
import { 
  Form, Input, Select, InputNumber, Button, Card, Typography, Space, 
  message, Row, Col, Divider, Switch, Tabs, Modal, Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import UploadHelper from '../Helper/UploadHelper';
import ShowImages from '../Helper/ShowImages';
import { addProduct, getSingleProduct, updateProduct } from '../Helper/apiHelper';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState('vendor Product');
  const [type, setType] = useState('Stand Alone Product');
  const [images, setImages] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [stockHistory, setStockHistory] = useState([]);
  const [showVariants, setShowVariants] = useState(false);

    const user_id = localStorage.getItem("user");

  // Fetch product if editing
  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      // Generate product code for new product
      generateProductCode();
      generateProductCodeSNo();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await getSingleProduct(id);
      
      if (product) {
        // Create a clean form data object without category/vendor fields
        const formData = { ...product };
        
        // Remove category and vendor related fields since we don't have them in the form anymore
        delete formData.category_details;
        delete formData.sub_category_details;
        delete formData.sub_product_category;
        delete formData.vendor_details;
        delete formData.vendor_product;
        delete formData.product_card_color;
        
        form.setFieldsValue({
          ...formData,
          GST: product.GST || '18%',
          stock_count: product.stock_count || 0,
          dropdown_gap: product.dropdown_gap || 0,
          max_quantity: product.max_quantity || 1,
          MRP_price: product.MRP_price || '',
          customer_product_price: product.customer_product_price || '',
          Deler_product_price: product.Deler_product_price || '',
          corporate_product_price: product.corporate_product_price || '',
          is_soldout: product.is_soldout || false,
          product_Lock: product.product_Lock || false,
          Tax_prefernce: product.Tax_prefernce || 'Inclusive',
          vendorDetails: user_id
        });
        
        setProductType('vendor Product');
        setType(product.type || 'Stand Alone Product');
        setImages(product.images || []);
        setVariantOptions(product.variants || []);
        setStockHistory(product.stock_info || []);
        setShowVariants(product.type === 'Variable Product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      message.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const generateProductCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const productCode = `PROD-${timestamp}-${randomStr}`;
    form.setFieldsValue({ product_code: productCode });
  };

  const generateProductCodeSNo = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const productCodeSNo = `SN-${timestamp}-${randomNum}`;
    form.setFieldsValue({ product_codeS_NO: productCodeSNo });
  };

  const handleTypeChange = (value) => {
    setType(value);
    setShowVariants(value === 'Variable Product');
    if (value === 'Stand Alone Product') {
      form.setFieldsValue({ variants: [] });
      setVariantOptions([]);
    }
  };

  const addVariantOption = () => {
    const newOption = {
      _id: Date.now(),
      variant_name: '',
      variant_type: 'text',
      options: []
    };
    setVariantOptions([...variantOptions, newOption]);
  };

  const updateVariantOption = (index, field, value) => {
    const updated = [...variantOptions];
    updated[index][field] = value;
    setVariantOptions(updated);
  };

  const removeVariantOption = (index) => {
    const updated = [...variantOptions];
    updated.splice(index, 1);
    setVariantOptions(updated);
  };

  const addOptionToVariant = (variantIndex) => {
    const updated = [...variantOptions];
    if (!updated[variantIndex].options) {
      updated[variantIndex].options = [];
    }
    updated[variantIndex].options.push({
      _id: Date.now().toString(),
      value: '',
      variant_type: updated[variantIndex].variant_type,
      image_names: []
    });
    setVariantOptions(updated);
  };

  const updateOptionValue = (variantIndex, optionIndex, field, value) => {
    const updated = [...variantOptions];
    updated[variantIndex].options[optionIndex][field] = value;
    setVariantOptions(updated);
  };

  const removeOption = (variantIndex, optionIndex) => {
    const updated = [...variantOptions];
    updated[variantIndex].options.splice(optionIndex, 1);
    setVariantOptions(updated);
  };

  const handleSave = async (status = 'active') => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Create a clean product data object without category/vendor fields
      const {
        category_details,
        sub_category_details,
        sub_product_category,
        vendor_details,
        vendor_product,
        product_card_color,
        seo_title,
        seo_url,
        seo_description,
        seo_keywords,
        seo_img,
        is_visible,
        new_product,
        recommended_product,
        popular_product,
        is_customer,
        is_dealer,
        is_corporate,
        is_BNI,
        parent_product_id,
        is_cloned,
        ...cleanValues
      } = values;

      const productData = {
        ...cleanValues,
        product_type: productType,
        type: type,
        images: images.map(img => typeof img === 'string' ? img : img.path || img.url),
        variants: showVariants ? variantOptions : [],
        variants_price: cleanValues.variants_price || [],
        description_tabs: cleanValues.description_tabs || [],
        quantity_discount_splitup: cleanValues.quantity_discount_splitup || [],
        stock_info: stockHistory,
        // Ensure all required fields have values
        HSNcode_time: cleanValues.HSNcode_time || '',
        product_codeS_NO: cleanValues.product_codeS_NO || '',
        Vendor_Code: cleanValues.Vendor_Code || '',
        Production_time: cleanValues.Production_time || '',
        Stock_Arrangement_time: cleanValues.Stock_Arrangement_time || '',
        name: cleanValues.name || '',
        Point_one: cleanValues.Point_one || '',
        Point_two: cleanValues.Point_two || '',
        Point_three: cleanValues.Point_three || '',
        Point_four: cleanValues.Point_four || '',
        stocks_status: cleanValues.stocks_status || 'In Stock',
        product_code: cleanValues.product_code || '',
        product_description_tittle: cleanValues.product_description_tittle || '',
        quantity_type: cleanValues.quantity_type || 'single',
        MRP_price: cleanValues.MRP_price || '',
        customer_product_price: cleanValues.customer_product_price || '',
        Deler_product_price: cleanValues.Deler_product_price || '',
        corporate_product_price: cleanValues.corporate_product_price || '',
      };

      console.log('Sending product data:', productData);

      let response;
      if (id) {
        response = await updateProduct(id, productData);
        message.success('Product updated successfully!');
      } else {
        response = await addProduct(productData);
        message.success('Product created successfully!');
      }

      setLoading(false);
      if (response && response.success) {
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save product');
      setLoading(false);
    }
  };

  const addStockEntry = () => {
    setStockHistory([...stockHistory, {
      date: new Date(),
      add_stock: 0,
      invoice: '',
      notes: ''
    }]);
  };

  const updateStockEntry = (index, field, value) => {
    const updated = [...stockHistory];
    updated[index][field] = value;
    setStockHistory(updated);
  };

  const removeStockEntry = (index) => {
    const updated = [...stockHistory];
    updated.splice(index, 1);
    setStockHistory(updated);
  };

  const handleVendorImageUpload = (variantIndex, optionIndex, imageUrls) => {
    const updated = [...variantOptions];
    if (!updated[variantIndex].options[optionIndex].image_names) {
      updated[variantIndex].options[optionIndex].image_names = [];
    }
    updated[variantIndex].options[optionIndex].image_names = imageUrls;
    setVariantOptions(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <Space>
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate('/inventory')}
              >
                Back
              </Button>
              <Title level={2} className="mb-0">
                {id ? 'Edit Product' : 'Add New Product'}
              </Title>
            </Space>
            <Space>
              <Button 
                onClick={() => handleSave('draft')} 
                loading={loading}
                disabled={loading}
              >
                Save as Draft
              </Button>
              <Button 
                type="primary" 
                onClick={() => handleSave('active')} 
                loading={loading}
                icon={<Save size={16} />}
                disabled={loading}
              >
                {id ? 'Update Product' : 'Save Product'}
              </Button>
            </Space>
          </div>
        </Card>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Basic Information Tab */}
          <TabPane tab="Basic Information" key="basic">
            <Card>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  product_type: 'vendor Product',
                  type: 'Stand Alone Product',
                  GST: '18%',
                  unit: 'piece',
                  quantity_type: 'single',
                  max_quantity: 1,
                  dropdown_gap: 0,
                  is_soldout: false,
                  product_Lock: false,
                  Tax_prefernce: 'Inclusive'
                }}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Product Name"
                      rules={[{ required: true, message: 'Product name is required' }]}
                    >
                      <Input placeholder="Enter product name" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="product_code"
                      label="Product Code"
                      rules={[{ required: true, message: 'Product code is required' }]}
                    >
                      <Input 
                        placeholder="Auto-generated" 
                        size="large" 
                        suffix={
                          <Button 
                            type="link" 
                            onClick={generateProductCode}
                            size="small"
                          >
                            Generate
                          </Button>
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="product_codeS_NO"
                      label="Product Code S/No"
                      rules={[{ required: true, message: 'Product code S/No is required' }]}
                    >
                      <Input 
                        placeholder="Auto-generated" 
                        size="large" 
                        suffix={
                          <Button 
                            type="link" 
                            onClick={generateProductCodeSNo}
                            size="small"
                          >
                            Generate
                          </Button>
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="type"
                      label="Product Variant Type"
                      rules={[{ required: true }]}
                    >
                      <Select onChange={handleTypeChange} size="large">
                        <Option value="Stand Alone Product">Stand Alone</Option>
                        <Option value="Variable Product">Variable Product</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="Vendor_Code"
                      label="Vendor Code"
                      rules={[{ required: true, message: 'Vendor code is required' }]}
                    >
                      <Input placeholder="Enter vendor code" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="HSNcode_time"
                      label="HSN Code"
                      rules={[{ required: true, message: 'HSN code is required' }]}
                    >
                      <Input placeholder="Enter HSN code" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="unit"
                      label="Unit"
                      rules={[{ required: true, message: 'Unit is required' }]}
                    >
                      <Select size="large">
                        <Option value="piece">Piece</Option>
                        <Option value="kg">Kilogram</Option>
                        <Option value="liter">Liter</Option>
                        <Option value="meter">Meter</Option>
                        <Option value="set">Set</Option>
                        <Option value="pair">Pair</Option>
                        <Option value="box">Box</Option>
                        <Option value="packet">Packet</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="GST"
                      label="GST Rate"
                    >
                      <Select size="large">
                        <Option value="0%">0%</Option>
                        <Option value="5%">5%</Option>
                        <Option value="12%">12%</Option>
                        <Option value="18%">18%</Option>
                        <Option value="28%">28%</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="Production_time"
                      label="Production Time (days)"
                      rules={[{ required: true, message: 'Production time is required' }]}
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="Stock_Arrangement_time"
                      label="Stock Arrangement Time (days)"
                      rules={[{ required: true, message: 'Stock arrangement time is required' }]}
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="product_Lock"
                      label="Product Lock"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren={<Lock size={12} />} unCheckedChildren={<Unlock size={12} />} />
                    </Form.Item>

                    <Form.Item
                      name="Tax_prefernce"
                      label="Tax Preference"
                    >
                      <Select size="large">
                        <Option value="Inclusive">Inclusive</Option>
                        <Option value="Exclusive">Exclusive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </TabPane>

          {/* Pricing Tab */}
          <TabPane tab="Pricing" key="pricing">
            <Card>
              <Form form={form} layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="MRP_price"
                      label="MRP Price (₹)"
                      rules={[{ required: true, message: 'MRP price is required' }]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="customer_product_price"
                      label="Customer Price (₹)"
                      rules={[{ required: true, message: 'Customer price is required' }]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="Deler_product_price"
                      label="Dealer Price (₹)"
                      rules={[{ required: true, message: 'Dealer price is required' }]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="corporate_product_price"
                      label="Corporate Price (₹)"
                      rules={[{ required: true, message: 'Corporate price is required' }]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        size="large"
                        formatter={value => `₹ ${value}`}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />
                
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="quantity_type"
                      label="Quantity Type"
                      rules={[{ required: true, message: 'Quantity type is required' }]}
                    >
                      <Select size="large">
                        <Option value="single">Single</Option>
                        <Option value="multiple">Multiple</Option>
                        <Option value="bulk">Bulk</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="max_quantity"
                      label="Max Quantity"
                    >
                      <InputNumber min={1} className="w-full" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="dropdown_gap"
                      label="Dropdown Gap"
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="quantity_discount_splitup"
                  label="Quantity Discount Splitup (JSON)"
                >
                  <TextArea rows={4} placeholder='[{"min_qty": 10, "max_qty": 50, "discount": 10}, ...]' />
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          {/* Stock & Inventory Tab */}
          <TabPane tab="Stock" key="stock">
            <Card>
              <Form form={form} layout="vertical">
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="stock_count"
                      label="Current Stock"
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="stocks_status"
                      label="Stock Status"
                      rules={[{ required: true, message: 'Stock status is required' }]}
                    >
                      <Select size="large">
                        <Option value="In Stock">In Stock</Option>
                        <Option value="Low Stock">Low Stock</Option>
                        <Option value="Out of Stock">Out of Stock</Option>
                        <Option value="Pre Order">Pre Order</Option>
                        <Option value="Discontinued">Discontinued</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="is_soldout"
                      label="Mark as Sold Out"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>Stock History</Divider>

                <Button 
                  type="dashed" 
                  onClick={addStockEntry} 
                  icon={<PlusOutlined />}
                  className="mb-4"
                >
                  Add Stock Entry
                </Button>

                {stockHistory.map((entry, index) => (
                  <Card key={index} className="mb-4" size="small">
                    <Row gutter={16} align="middle">
                      <Col span={4}>
                        <Input
                          type="date"
                          value={entry.date ? new Date(entry.date).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateStockEntry(index, 'date', e.target.value)}
                        />
                      </Col>
                      <Col span={4}>
                        <InputNumber
                          value={entry.add_stock}
                          onChange={(value) => updateStockEntry(index, 'add_stock', value)}
                          placeholder="Quantity"
                          min={0}
                          className="w-full"
                        />
                      </Col>
                      <Col span={6}>
                        <Input
                          value={entry.invoice}
                          onChange={(e) => updateStockEntry(index, 'invoice', e.target.value)}
                          placeholder="Invoice Number"
                        />
                      </Col>
                      <Col span={8}>
                        <Input
                          value={entry.notes}
                          onChange={(e) => updateStockEntry(index, 'notes', e.target.value)}
                          placeholder="Notes"
                        />
                      </Col>
                      <Col span={2}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeStockEntry(index)}
                          size="small"
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Form>
            </Card>
          </TabPane>

          {/* Description Tab */}
          <TabPane tab="Description" key="description">
            <Card>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="product_description_tittle"
                  label="Description Title"
                  rules={[{ required: true, message: 'Description title is required' }]}
                >
                  <Input placeholder="Enter description title" size="large" />
                </Form.Item>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="Point_one"
                      label="Feature 1"
                      rules={[{ required: true, message: 'Feature 1 is required' }]}
                    >
                      <Input placeholder="Enter feature" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="Point_two"
                      label="Feature 2"
                      rules={[{ required: true, message: 'Feature 2 is required' }]}
                    >
                      <Input placeholder="Enter feature" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="Point_three"
                      label="Feature 3"
                      rules={[{ required: true, message: 'Feature 3 is required' }]}
                    >
                      <Input placeholder="Enter feature" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="Point_four"
                      label="Feature 4"
                      rules={[{ required: true, message: 'Feature 4 is required' }]}
                    >
                      <Input placeholder="Enter feature" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description_tabs"
                  label="Additional Description Tabs (JSON)"
                >
                  <TextArea 
                    rows={4} 
                    placeholder='[{"title": "Specifications", "content": "Product specifications..."}, ...]' 
                  />
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          {/* Variants Tab - Only show for Variable Product */}
          {showVariants && (
            <TabPane tab="Variants" key="variants">
              <Card>
                <div className="mb-6">
                  <Button 
                    type="primary" 
                    onClick={addVariantOption}
                    icon={<PlusOutlined />}
                  >
                    Add Variant
                  </Button>
                </div>

                {variantOptions.map((variant, vIndex) => (
                  <Card key={variant._id} className="mb-6" 
                    title={
                      <Space>
                        <Input
                          value={variant.variant_name}
                          onChange={(e) => updateVariantOption(vIndex, 'variant_name', e.target.value)}
                          placeholder="Variant Name (e.g., Color, Size)"
                          size="large"
                          style={{ width: 200 }}
                        />
                        <Tag color="blue">ID: {variant._id}</Tag>
                      </Space>
                    }
                    extra={
                      <Button 
                        danger 
                        onClick={() => removeVariantOption(vIndex)}
                        icon={<DeleteOutlined />}
                      >
                        Remove
                      </Button>
                    }
                  >
                    <Row gutter={16} align="middle" className="mb-4">
                      <Col span={8}>
                        <Select
                          value={variant.variant_type}
                          onChange={(value) => updateVariantOption(vIndex, 'variant_type', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="text">Text</Option>
                          <Option value="color">Color</Option>
                          <Option value="image">Image</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Button 
                          type="dashed" 
                          onClick={() => addOptionToVariant(vIndex)}
                          icon={<PlusOutlined />}
                        >
                          Add Option
                        </Button>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                      {variant.options?.map((option, oIndex) => (
                        <Col span={8} key={option._id}>
                          <Card size="small" className="mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Input
                                  value={option.value}
                                  onChange={(e) => updateOptionValue(vIndex, oIndex, 'value', e.target.value)}
                                  placeholder="Option value"
                                />
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeOption(vIndex, oIndex)}
                                />
                              </div>
                              
                              {variant.variant_type === 'image' && (
                                <div>
                                  <Text strong className="block mb-1">Option Images:</Text>
                                  <UploadHelper 
                                    setImagePath={(images) => handleVendorImageUpload(vIndex, oIndex, images)}
                                    image_path={option.image_names || []}
                                    multiple={true}
                                    max={5}
                                  />
                                  {option.image_names && option.image_names.length > 0 && (
                                    <ShowImages 
                                      path={option.image_names} 
                                      setImage={(images) => handleVendorImageUpload(vIndex, oIndex, images)}
                                      multiple={true}
                                    />
                                  )}
                                </div>
                              )}
                              
                              <Tag color="green">ID: {option._id}</Tag>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                ))}

                <Divider />

                <Form.Item
                  name="variants_price"
                  label="Variant Prices (JSON)"
                >
                  <TextArea 
                    rows={4} 
                    placeholder='[{"variant_id": "1", "option_id": "1", "price": 100}, ...]' 
                  />
                </Form.Item>
              </Card>
            </TabPane>
          )}

          {/* Images Tab */}
          <TabPane tab="Images" key="images">
            <Card>
              <Form.Item 
                label="Product Images"
                rules={[{ required: images.length === 0, message: 'At least one image is required' }]}
              >
                <div className="flex flex-col gap-4">
                  {images.length > 0 && (
                    <ShowImages path={images} setImage={setImages} multiple={true} />
                  )}
                  
                  {images.length < 10 && (
                    <UploadHelper 
                      setImagePath={setImages} 
                      image_path={images} 
                      multiple={true} 
                      max={10} 
                    />
                  )}
                  
                  <Text type="secondary">
                    Upload up to 10 images. First image will be used as main image.
                  </Text>
                </div>
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AddProduct;